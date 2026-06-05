import { Redis } from "@upstash/redis";

import {
  type CreatePositionRequest,
  GetPositionsResponseSchema,
  GetPositionsSummaryResponseSchema,
  type Position,
  PositionSchema,
  type PositionRoleCategory,
  type UpdatePositionRequest,
} from "./position.schema";
import { mockPositions } from "./positions.mock";

type PositionsStore = {
  positions: Position[];
};

type ListPositionsPageParams = {
  page: number;
  pageSize: number;
  search: string;
  role: PositionRoleCategory | null;
};

const globalForPositions = globalThis as typeof globalThis & {
  __positionsDemoStore?: PositionsStore;
  __positionsDemoRedis?: Redis;
};

const REDIS_NAMESPACE = "positions-demo:v3";
const POSITION_IDS_KEY = `${REDIS_NAMESPACE}:ids`;
const POSITION_NEXT_ID_KEY = `${REDIS_NAMESPACE}:next-id`;
const POSITION_SEEDED_KEY = `${REDIS_NAMESPACE}:seeded`;
const POSITION_SEED_VERSION = "mock-positions-1000";
const POSITION_ROLES: PositionRoleCategory[] = [
  "headquarter",
  "manager",
  "staff",
  "trainer",
  "observer",
];

function getPositionKey(id: number) {
  return `${REDIS_NAMESPACE}:item:${id}`;
}

function getPositionRoleIdsKey(role: PositionRoleCategory) {
  return `${REDIS_NAMESPACE}:role:${role}:ids`;
}

function cloneInitialPositions() {
  return mockPositions.map((position) =>
    PositionSchema.parse({
      ...position,
      features: {
        ...position.features,
      },
    }),
  );
}

const store = (globalForPositions.__positionsDemoStore ??= {
  positions: cloneInitialPositions(),
});

function getRedis() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return (globalForPositions.__positionsDemoRedis ??= new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    }));
  }

  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return (globalForPositions.__positionsDemoRedis ??= Redis.fromEnv());
  }

  return null;
}

function buildPosition(
  id: number,
  values: CreatePositionRequest | UpdatePositionRequest,
) {
  return PositionSchema.parse({
    id,
    role: values.role,
    position_name: values.position_name,
    features: {
      description: values.description,
      ...Object.fromEntries(
        values.permissions.map((permission) => [permission, true]),
      ),
    },
  });
}

function filterPositions(
  positions: Position[],
  search: string,
  role: PositionRoleCategory | null,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return positions.filter((position) => {
    const matchesSearch = position.position_name
      .toLowerCase()
      .includes(normalizedSearch);
    const matchesRole = role === null || position.role === role;

    return matchesSearch && matchesRole;
  });
}

async function savePositionToRedis(redis: Redis, position: Position) {
  await redis.set(getPositionKey(position.id), position);
  await redis.zadd(POSITION_IDS_KEY, {
    score: position.id,
    member: String(position.id),
  });
  await redis.zadd(getPositionRoleIdsKey(position.role), {
    score: position.id,
    member: String(position.id),
  });
}

async function seedRedisIfNeeded(redis: Redis) {
  const seededVersion = await redis.get<string | boolean>(POSITION_SEEDED_KEY);

  if (seededVersion === POSITION_SEED_VERSION) {
    return;
  }

  const initialPositions = cloneInitialPositions();
  const batchSize = 100;

  for (let index = 0; index < initialPositions.length; index += batchSize) {
    const pipeline = redis.pipeline();
    const batch = initialPositions.slice(index, index + batchSize);

    for (const position of batch) {
      pipeline.set(getPositionKey(position.id), position);
      pipeline.zadd(POSITION_IDS_KEY, {
        score: position.id,
        member: String(position.id),
      });
      pipeline.zadd(getPositionRoleIdsKey(position.role), {
        score: position.id,
        member: String(position.id),
      });
    }

    await pipeline.exec();
  }

  const maxId =
    initialPositions.length === 0
      ? 0
      : Math.max(...initialPositions.map((position) => position.id));

  await redis
    .pipeline()
    .set(POSITION_NEXT_ID_KEY, maxId)
    .set(POSITION_SEEDED_KEY, POSITION_SEED_VERSION)
    .exec();
}

async function readPositionItems(redis: Redis, ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const positions = await redis.mget<Position[]>(
    ...ids.map((id) => getPositionKey(Number(id))),
  );

  return positions
    .filter((position): position is Position => position !== null)
    .map((position) => PositionSchema.parse(position));
}

async function listRedisPositionsByIndex(
  redis: Redis,
  params: ListPositionsPageParams,
) {
  await seedRedisIfNeeded(redis);

  const indexKey =
    params.role === null
      ? POSITION_IDS_KEY
      : getPositionRoleIdsKey(params.role);

  if (params.search.trim() === "") {
    const totalItems = await redis.zcard(indexKey);
    const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
    const page = Math.min(params.page, totalPages);
    const pageStartIndex = (page - 1) * params.pageSize;
    const ids = await redis.zrange<string[]>(
      indexKey,
      pageStartIndex,
      pageStartIndex + params.pageSize - 1,
    );
    const positions = await readPositionItems(redis, ids);

    return GetPositionsResponseSchema.parse({
      positions,
      pagination: {
        page,
        pageSize: params.pageSize,
        totalItems,
        totalPages,
      },
    });
  }

  const ids = await redis.zrange<string[]>(indexKey, 0, -1);
  const candidatePositions = await readPositionItems(redis, ids);
  const filteredPositions = filterPositions(
    candidatePositions,
    params.search,
    null,
  );
  const totalItems = filteredPositions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
  const page = Math.min(params.page, totalPages);
  const pageStartIndex = (page - 1) * params.pageSize;

  return GetPositionsResponseSchema.parse({
    positions: filteredPositions.slice(
      pageStartIndex,
      pageStartIndex + params.pageSize,
    ),
    pagination: {
      page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    },
  });
}

function listMemoryPositionsPage(params: ListPositionsPageParams) {
  const filteredPositions = filterPositions(
    store.positions,
    params.search,
    params.role,
  );
  const totalItems = filteredPositions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
  const page = Math.min(params.page, totalPages);
  const startIndex = (page - 1) * params.pageSize;

  return GetPositionsResponseSchema.parse({
    positions: filteredPositions.slice(
      startIndex,
      startIndex + params.pageSize,
    ),
    pagination: {
      page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    },
  });
}

function logRedisReadFallback(operation: string, error: unknown) {
  console.error(`Redis ${operation} failed, using mock fallback:`, error);
}

export async function listPositionsPage(params: ListPositionsPageParams) {
  const redis = getRedis();

  if (!redis) {
    return listMemoryPositionsPage(params);
  }

  try {
    return await listRedisPositionsByIndex(redis, params);
  } catch (error) {
    logRedisReadFallback("list positions page", error);

    return listMemoryPositionsPage(params);
  }
}

export async function listPositions() {
  const redis = getRedis();

  if (!redis) {
    return store.positions;
  }

  try {
    await seedRedisIfNeeded(redis);

    const ids = await redis.zrange<string[]>(POSITION_IDS_KEY, 0, -1);

    return await readPositionItems(redis, ids);
  } catch (error) {
    logRedisReadFallback("list all positions", error);

    return store.positions;
  }
}

export async function getPositionsSummary() {
  const redis = getRedis();

  if (!redis) {
    return GetPositionsSummaryResponseSchema.parse({
      totalPositions: store.positions.length,
      totalRoles: new Set(store.positions.map((position) => position.role))
        .size,
    });
  }

  try {
    await seedRedisIfNeeded(redis);

    const totalPositions = await redis.zcard(POSITION_IDS_KEY);
    const roleCounts = await Promise.all(
      POSITION_ROLES.map((role) => redis.zcard(getPositionRoleIdsKey(role))),
    );

    return GetPositionsSummaryResponseSchema.parse({
      totalPositions,
      totalRoles: roleCounts.filter((count) => count > 0).length,
    });
  } catch (error) {
    logRedisReadFallback("get positions summary", error);

    return GetPositionsSummaryResponseSchema.parse({
      totalPositions: store.positions.length,
      totalRoles: new Set(store.positions.map((position) => position.role))
        .size,
    });
  }
}

export async function createPosition(values: CreatePositionRequest) {
  const redis = getRedis();

  if (!redis) {
    const nextId =
      store.positions.length === 0
        ? 1
        : Math.max(...store.positions.map((position) => position.id)) + 1;
    const position = buildPosition(nextId, values);
    store.positions.push(position);

    return position;
  }

  await seedRedisIfNeeded(redis);

  const nextId = await redis.incr(POSITION_NEXT_ID_KEY);
  const position = buildPosition(nextId, values);
  await savePositionToRedis(redis, position);

  return position;
}

export async function updatePosition(values: UpdatePositionRequest) {
  const redis = getRedis();

  if (!redis) {
    const index = store.positions.findIndex(
      (position) => position.id === values.id,
    );

    if (index === -1) {
      return null;
    }

    const position = buildPosition(values.id, values);
    store.positions[index] = position;

    return position;
  }

  await seedRedisIfNeeded(redis);

  const currentPosition = await redis.get<Position>(getPositionKey(values.id));

  if (!currentPosition) {
    return null;
  }

  const position = buildPosition(values.id, values);

  if (currentPosition.role !== position.role) {
    await redis.zrem(
      getPositionRoleIdsKey(currentPosition.role),
      String(values.id),
    );
  }

  await savePositionToRedis(redis, position);

  return position;
}

export async function deletePosition(id: number) {
  const redis = getRedis();

  if (!redis) {
    const index = store.positions.findIndex((position) => position.id === id);

    if (index === -1) {
      return false;
    }

    store.positions.splice(index, 1);

    return true;
  }

  await seedRedisIfNeeded(redis);

  const position = await redis.get<Position>(getPositionKey(id));

  if (!position) {
    return false;
  }

  await redis.del(getPositionKey(id));
  await redis.zrem(POSITION_IDS_KEY, String(id));
  await redis.zrem(getPositionRoleIdsKey(position.role), String(id));

  return true;
}
