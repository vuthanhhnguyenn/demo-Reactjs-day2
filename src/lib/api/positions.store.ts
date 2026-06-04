import {
  type CreatePositionRequest,
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
};

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

export function listPositions() {
  return store.positions;
}

export function createPosition(values: CreatePositionRequest) {
  const nextId =
    store.positions.length === 0
      ? 1
      : Math.max(...store.positions.map((position) => position.id)) + 1;

  const position = buildPosition(nextId, values);
  store.positions.push(position);

  return position;
}

export function updatePosition(values: UpdatePositionRequest) {
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

export function deletePosition(id: number) {
  const index = store.positions.findIndex((position) => position.id === id);

  if (index === -1) {
    return false;
  }

  store.positions.splice(index, 1);

  return true;
}
