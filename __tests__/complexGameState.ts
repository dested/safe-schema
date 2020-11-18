import {generateSchema, makeCustomSchema, makeSchema} from '../src';
import {ArrayBufferReader} from '../src/arrayBufferBuilder';

export type OfFaction<T> = {[faction in PlayableFactionId]?: T};
export type EntityType = 'infantry' | 'tank' | 'plane' | 'factory';
export type EntityAction = 'attack' | 'move' | 'spawn-infantry' | 'spawn-tank' | 'spawn-plane' | 'mine';

export type PlayableFactionId = 1 | 2 | 3;

export interface ProcessedVote {
  entityId: number;
  action: EntityAction;
  factionId: PlayableFactionId;
  hexId: string;
  voteCount?: number;
  path?: string[];
}

export interface GameState {
  gameId: string;
  factions: number[];
  factionDetails: OfFaction<FactionDetail>;
  entities: OfFaction<GameStateEntity[]>;
  resources: GameStateResource[];
  generation: number;
  roundDuration: number;
  roundStart: number;
  roundEnd: number;

  totalPlayersVoted: number;
  winningVotes: OfFaction<ProcessedVote[]>;
  playersVoted: OfFaction<number>;
  scores: OfFaction<number>;
  hotEntities: OfFaction<{id: number; count: number}[]>;
  notes: OfFaction<VoteNote[]>;
}
export interface VoteNote {
  note: string;
  action: EntityAction;
  fromEntityId: number;
  factionId: PlayableFactionId;
  toEntityId?: number;
  toHexId: string;
  fromHexId: string;
  voteCount: number;
  path: string[];
}

export interface FactionDetail {
  resourceCount: number;
}

export interface GameStateEntity {
  x: number;
  y: number;
  id: number;
  busy?: GameStateGameEntityBusyDetails;
  entityType: EntityType;
  health: number;
  healthRegenStep: number;
  facingDirection: FacingDirection;
}
export enum FacingDirection {
  TopLeft = 0,
  TopRight = 1,
  BottomLeft = 2,
  BottomRight = 3,
  Left = 4,
  Right = 5,
}

export interface GameStateGameEntityBusyDetails {
  ticks: number;
  action: EntityAction;
  hexId: string;
}

export interface GameStateResource {
  x: number;
  y: number;
  count: number;
  type: ResourceType;
}
export type ResourceType = 'bronze' | 'silver' | 'gold';

export const customSchemaTypes = makeCustomSchema({
  hexId: {
    read: (buffer): string => buffer.readInt16() + '-' + buffer.readInt16(),
    write: (model: string, buffer) => {
      const hexIdParse = /(-?\d*)-(-?\d*)/;
      const hexIdResult = hexIdParse.exec(model);
      const x = parseInt(hexIdResult[1]);
      const y = parseInt(hexIdResult[2]);
      buffer.addInt16(x);
      buffer.addInt16(y);
    },
    size: (model: string) => 2 + 2,
  },
  byteArray: {
    read: (buffer): number[] => {
      const byteArray = (len: number, realLength: number, reader: ArrayBufferReader) => {
        function padLeft(data, size, paddingChar) {
          return (new Array(size + 1).join(paddingChar) + data).slice(-size);
        }
        let items: number[] = [];
        for (let i = 0; i < len; i++) {
          items.push(
            ...padLeft(reader.readUint32().toString(8), 10, '0')
              .split('')
              .map((a) => parseInt(a))
          );
        }
        return items.slice(0, realLength);
      };

      return byteArray(buffer.readUint32(), buffer.readUint32(), buffer);
    },
    write: (model: number[], buffer) => {
      const byteLen = Math.ceil(model.length / 10);
      buffer.addUint32(byteLen);
      buffer.addUint32(model.length);
      for (let model_i = 0; model_i < byteLen; model_i++) {
        buffer.addUint32(parseInt(model.slice(model_i * 10, (model_i + 1) * 10).join(''), 8));
      }
    },
    size: (model: number[]) => 4 + 4 + Math.ceil(model.length / 10) * 4,
  },
});

export const GameStateSchema = makeSchema<GameState, typeof customSchemaTypes>({
  gameId: 'string',
  factions: 'byteArray',
  factionDetails: {
    '1': {
      flag: 'optional',
      element: {
        resourceCount: 'uint16',
      },
    },
    2: {
      flag: 'optional',
      element: {
        resourceCount: 'uint16',
      },
    },
    '3': {
      flag: 'optional',
      element: {
        resourceCount: 'uint16',
      },
    },
  },
  entities: {
    1: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          x: 'int16',
          y: 'int16',
          health: 'uint8',
          id: 'uint32',
          healthRegenStep: 'uint8',
          facingDirection: 'uint8',
          entityType: {flag: 'enum', factory: 1, infantry: 2, plane: 3, tank: 4},
          busy: {
            flag: 'optional',
            element: {
              action: {
                flag: 'enum',
                'spawn-infantry': 1,
                'spawn-tank': 2,
                'spawn-plane': 3,
                attack: 4,
                mine: 5,
                move: 6,
              },
              hexId: 'hexId',
              ticks: 'uint32',
            },
          },
        },
      },
    },
    2: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          x: 'int16',
          y: 'int16',
          health: 'uint8',
          id: 'uint32',
          healthRegenStep: 'uint8',
          facingDirection: 'uint8',
          entityType: {flag: 'enum', factory: 1, infantry: 2, plane: 3, tank: 4},
          busy: {
            flag: 'optional',
            element: {
              action: {
                flag: 'enum',
                'spawn-infantry': 1,
                'spawn-tank': 2,
                'spawn-plane': 3,
                attack: 4,
                mine: 5,
                move: 6,
              },
              hexId: 'hexId',
              ticks: 'uint32',
            },
          },
        },
      },
    },
    3: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          x: 'int16',
          y: 'int16',
          health: 'uint8',
          id: 'uint32',
          healthRegenStep: 'uint8',
          facingDirection: 'uint8',
          entityType: {flag: 'enum', factory: 1, infantry: 2, plane: 3, tank: 4},
          busy: {
            flag: 'optional',
            element: {
              action: {
                flag: 'enum',
                'spawn-infantry': 1,
                'spawn-tank': 2,
                'spawn-plane': 3,
                attack: 4,
                mine: 5,
                move: 6,
              },
              hexId: 'hexId',
              ticks: 'uint32',
            },
          },
        },
      },
    },
  },
  resources: {
    flag: 'array-uint16',
    elements: {
      count: 'uint16',
      type: {flag: 'enum', silver: 1, gold: 2, bronze: 3},
      x: 'int16',
      y: 'int16',
    },
  },
  generation: 'uint16',
  roundDuration: 'uint16',
  roundStart: 'float64',
  roundEnd: 'float64',

  totalPlayersVoted: 'uint16',
  winningVotes: {
    1: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            mine: 1,
            attack: 2,
            'spawn-tank': 3,
            'spawn-plane': 4,
            'spawn-infantry': 5,
            move: 6,
          },
          entityId: 'uint32',
          hexId: 'hexId',
          factionId: {
            flag: 'number-enum',
            1: 1,
            2: 2,
            3: 3,
          },
          path: {
            flag: 'optional',
            element: {
              flag: 'array-uint8',
              elements: 'string',
            },
          },
          voteCount: {
            flag: 'optional',
            element: 'uint16',
          },
        },
      },
    },
    2: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            mine: 1,
            attack: 2,
            'spawn-tank': 3,
            'spawn-plane': 4,
            'spawn-infantry': 5,
            move: 6,
          },
          entityId: 'uint32',
          hexId: 'hexId',
          factionId: {
            flag: 'number-enum',
            1: 1,
            2: 2,
            3: 3,
          },
          path: {
            flag: 'optional',
            element: {
              flag: 'array-uint8',
              elements: 'string',
            },
          },
          voteCount: {
            flag: 'optional',
            element: 'uint16',
          },
        },
      },
    },
    3: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            mine: 1,
            attack: 2,
            'spawn-tank': 3,
            'spawn-plane': 4,
            'spawn-infantry': 5,
            move: 6,
          },
          entityId: 'uint32',
          hexId: 'hexId',
          factionId: {
            flag: 'number-enum',
            1: 1,
            2: 2,
            3: 3,
          },
          path: {
            flag: 'optional',
            element: {
              flag: 'array-uint8',
              elements: 'string',
            },
          },
          voteCount: {
            flag: 'optional',
            element: 'uint16',
          },
        },
      },
    },
  },
  playersVoted: {
    1: {flag: 'optional', element: 'uint16'},
    2: {flag: 'optional', element: 'uint16'},
    3: {flag: 'optional', element: 'uint16'},
  },
  scores: {
    1: {flag: 'optional', element: 'uint32'},
    2: {flag: 'optional', element: 'uint32'},
    3: {flag: 'optional', element: 'uint32'},
  },
  hotEntities: {
    1: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          count: 'uint16',
          id: 'uint32',
        },
      },
    },
    2: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          count: 'uint16',
          id: 'uint32',
        },
      },
    },
    3: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          count: 'uint16',
          id: 'uint32',
        },
      },
    },
  },
  notes: {
    1: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            'spawn-infantry': 1,
            'spawn-plane': 2,
            'spawn-tank': 3,
            attack: 4,
            mine: 5,
            move: 6,
          },
          factionId: {
            flag: 'number-enum',
            1: 1,
            2: 2,
            3: 3,
          },
          fromEntityId: 'int16',
          fromHexId: 'hexId',
          note: 'string',
          path: {
            flag: 'array-uint8',
            elements: 'string',
          },
          toEntityId: {
            flag: 'optional',
            element: 'uint32',
          },
          toHexId: 'hexId',
          voteCount: 'uint16',
        },
      },
    },
    2: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            'spawn-infantry': 1,
            'spawn-plane': 2,
            'spawn-tank': 3,
            attack: 4,
            mine: 5,
            move: 6,
          },
          factionId: {
            flag: 'number-enum',
            1: 1,
            2: 2,
            3: 3,
          },
          fromEntityId: 'int16',
          fromHexId: 'hexId',
          note: 'string',
          path: {
            flag: 'array-uint8',
            elements: 'string',
          },
          toEntityId: {
            flag: 'optional',
            element: 'uint32',
          },
          toHexId: 'hexId',
          voteCount: 'uint16',
        },
      },
    },
    3: {
      flag: 'optional',
      element: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            'spawn-infantry': 1,
            'spawn-plane': 2,
            'spawn-tank': 3,
            attack: 4,
            mine: 5,
            move: 6,
          },
          factionId: {
            flag: 'number-enum',
            1: 1,
            2: 2,
            3: 3,
          },
          fromEntityId: 'int16',
          fromHexId: 'hexId',
          note: 'string',
          path: {
            flag: 'array-uint8',
            elements: 'string',
          },
          toEntityId: {
            flag: 'optional',
            element: 'uint32',
          },
          toHexId: 'hexId',
          voteCount: 'uint16',
        },
      },
    },
  },
});

test('complex game state test', () => {
  const generator = generateSchema(GameStateSchema, customSchemaTypes);

  const model: GameState = {
    gameId: 'abc',
    roundDuration: 200,
    roundEnd: 100,
    roundStart: 200,

    resources: [
      {
        x: 1,
        y: 2,
        type: 'bronze',
        count: 3,
      },
      {
        x: 11,
        y: 12,
        type: 'gold',
        count: 13,
      },
      {
        x: 21,
        y: 22,
        type: 'silver',
        count: 23,
      },
    ],
    factionDetails: {1: {resourceCount: 12}, 2: {resourceCount: 13}, 3: {resourceCount: 14}},
    entities: {
      1: [
        {
          busy: undefined,
          x: 1,
          y: 2,
          entityType: 'factory',
          facingDirection: FacingDirection.BottomLeft,
          health: 3,
          healthRegenStep: 4,
          id: 5,
        },
      ],
      2: [
        {
          busy: undefined,
          x: 3,
          y: 4,
          entityType: 'factory',
          facingDirection: FacingDirection.Right,
          health: 3,
          healthRegenStep: 4,
          id: 6,
        },
      ],
      3: [
        {
          busy: undefined,
          x: 31,
          y: 32,
          entityType: 'factory',
          facingDirection: FacingDirection.BottomLeft,
          health: 33,
          healthRegenStep: 34,
          id: 35,
        },
        {
          x: 41,
          y: 42,
          busy: {
            action: 'attack',
            hexId: '123-456',
            ticks: 20000000,
          },
          entityType: 'tank',
          facingDirection: FacingDirection.TopRight,
          health: 43,
          healthRegenStep: 44,
          id: 45,
        },
      ],
    },
    factions: [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
    ],
    totalPlayersVoted: 24,
    generation: 5000,

    hotEntities: {
      1: [{count: 1, id: 2}],
      2: [{count: 3, id: 4}],
      3: [
        {count: 5, id: 6},
        {count: 5, id: 6},
        {count: 5, id: 6},
        {count: 5, id: 6},
        {count: 7, id: 8},
      ],
    },
    winningVotes: {
      1: [
        {
          action: 'mine',
          factionId: 1,
          path: ['a', 'b'],
          voteCount: 12,
          entityId: 333,
          hexId: '12-32331',
        },
      ],
      2: [
        {
          action: 'spawn-infantry',
          factionId: 1,
          path: ['a', 'b'],
          voteCount: 12,
          entityId: 333,
          hexId: '12-32331',
        },
      ],
      3: [
        {
          action: 'spawn-plane',
          factionId: 1,
          path: ['a', 'b'],
          voteCount: 12,
          entityId: 3233,
          hexId: '112-32331',
        },
      ],
    },
    playersVoted: {
      1: 0,
      2: 1,
      3: 2,
    },
    scores: {
      1: 3,
      2: 4,
      3: 5,
    },
    notes: {
      1: [
        {
          action: 'mine',
          factionId: 1,
          fromEntityId: 123,
          fromHexId: '423--334',
          note: 'hi hi ho',
          path: ['a', 'b'],
          toEntityId: 789,
          toHexId: '888-777',
          voteCount: 12,
        },
      ],
      2: [
        {
          toEntityId: undefined,
          action: 'attack',
          factionId: 1,
          fromEntityId: 123,
          fromHexId: '423--334',
          note: 'hi hi ho',
          path: ['a', 'b'],
          toHexId: '888-777',
          voteCount: 12,
        },
      ],
      3: [
        {
          action: 'spawn-tank',
          factionId: 1,
          fromEntityId: 123,
          fromHexId: '423--334',
          note: 'hi hi ho',
          path: ['a', 'b'],
          toEntityId: 789,
          toHexId: '444-777',
          voteCount: 12,
        },
      ],
    },
  };
  const buffer = generator.toBuffer(model);
  expect(buffer.byteLength).toEqual(452);

  const result = generator.fromBuffer(buffer);
  expect(result).toEqual(model);
});
