// Create a reusable schema-like factory that models can call
const makeSchema = () => ({
  pre: jest.fn(),
  post: jest.fn(),
  index: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  virtual: jest.fn(() => ({ get: jest.fn() })),
  methods: {},
  statics: {},
  Types: { ObjectId: jest.fn() },
});

jest.mock('mongoose', () => {
  const schemaMock = jest.fn().mockImplementation(makeSchema);

  // Schema.Types.ObjectId must exist as a static on Schema itself
  schemaMock.Types = { ObjectId: jest.fn() };

  return {
    connect: jest.fn(() => Promise.resolve()),
    connection: { close: jest.fn() },
    Schema: schemaMock,
    model: jest.fn(),
  };
});
