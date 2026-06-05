import { Redis } from "@upstash/redis";

import {
  type CreatePositionRequest,
  GetPositionsResponseSchema,
  type Position,
  PositionSchema,
  type UpdatePositionRequest,
} from "./position.schema";
import { mockPositions } from "./positions.mock";

type PositionsStore = {
  positions: Position[];
};

const globalForPositions = globalThis as typeof globalThis & {
  __positionsDemoStore?: PositionsStore;
  __positionsDemoRedis?: Redis;
};

const POSITIONS_REDIS_KEY = "positions-demo:positions:new";

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

async function readPositions() {
  const redis = getRedis();

  if (!redis) {
    return store.positions;
  }

  const positions = await redis.get<Position[]>(POSITIONS_REDIS_KEY);

  if (positions) {
    return GetPositionsResponseSchema.parse({ positions }).positions;
  }

  const initialPositions = cloneInitialPositions();
  await redis.set(POSITIONS_REDIS_KEY, initialPositions);

  return initialPositions;
}

async function writePositions(positions: Position[]) {
  const redis = getRedis();
  const parsedPositions = GetPositionsResponseSchema.parse({
    positions,
  }).positions;

  if (!redis) {
    store.positions = parsedPositions;
    return;
  }

  await redis.set(POSITIONS_REDIS_KEY, parsedPositions);
}

export async function listPositions() {
  return readPositions();
}

export async function createPosition(values: CreatePositionRequest) {
  const positions = await readPositions();
  const nextId =
    positions.length === 0
      ? 1
      : Math.max(...positions.map((position) => position.id)) + 1;

  const position = buildPosition(nextId, values);
  await writePositions([...positions, position]);

  return position;
}

export async function updatePosition(values: UpdatePositionRequest) {
  const positions = await readPositions();
  const index = positions.findIndex((position) => position.id === values.id);

  if (index === -1) {
    return null;
  }

  const position = buildPosition(values.id, values);
  const nextPositions = [...positions];
  nextPositions[index] = position;

  await writePositions(nextPositions);

  return position;
}

export async function deletePosition(id: number) {
  const positions = await readPositions();
  const index = positions.findIndex((position) => position.id === id);

  if (index === -1) {
    return false;
  }

  await writePositions(positions.filter((position) => position.id !== id));

  return true;
}
