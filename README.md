# Leyyo: Query
> Query library for Leyyo framework

## Import
- `npm i @leyyo/query`

## Blueprint

#### Items
| Type       | Name                                     | FQN | Description  |
|------------|------------------------------------------|-----|--------------|
| `instance` | [queryParser](src/items/query.parser.ts) | ☑   | query parser |

#### Errors
| Name                                                               | Emit | I18N | Foretell | FQN | Description |
|--------------------------------------------------------------------|------|------|----------|-----|-------------|
| [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | ☑    | ☑    | ☑        | ☑   |             |

#### Enumerations
| Type      | Name                                           | FQN | Foretell | Description |
|-----------|------------------------------------------------|-----|----------|-------------|
| `literal` | [OperationType](src/literal/operation-type.ts) | ☑   | ☑        | operation   |
| `literal` | [OrderType](src/literal/order-type.ts)         | ☑   | ☑        | order type  |

#### Test Cases
| Case  | Error                                                              | Message                                                                                          | Command |
|-------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|---------|
| `100` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Field should be valid text*                                                                     |         |
| `101` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Raw data should be valid text*                                                                  |         |
| `102` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *It should be %d as minimum*                                                                     |         |
| `103` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Value should be numeric*                                                                        |         |
| `104` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Field or raw are not provided, one of them should be*                                           |         |
| `105` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Field and raw are provided together, Field or raw are not provided, only one of them should be* |         |
| `110` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Order type should be valid*                                                                     |         |
| `111` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid order by item*                                                                          |         |
| `112` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid order by block*                                                                         |         |
| `120` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *As command should be valid text*                                                                |         |
| `121` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid select item*                                                                            |         |
| `122` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid select block*                                                                           |         |
| `130` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Operation command should be valid*                                                              |         |
| `131` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Value should not be empty or spaced string*                                                     |         |
| `132` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Value should be string, number or boolean*                                                      |         |
| `133` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Value should be valid*                                                                          |         |
| `134` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid select item*                                                                            |         |
| `135` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid select block*                                                                           |         |
| `144` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid having item*                                                                            |         |
| `145` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid having block*                                                                           |         |
| `150` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid group by item*                                                                          |         |
| `151` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid group by block*                                                                         |         |
| `160` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *If you give page; limit and offset can not be used anymore*                                     |         |
| `161` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *If you give limit; page and size can not be used anymore*                                       |         |
| `162` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Pagination should have limit/offset or page/size keys*                                          |         |
| `163` | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | *Invalid pagination block*                                                                       |         |

#### Loaders
| Type       | Name                                                     |
|------------|----------------------------------------------------------|
| `foretell` | [leyyoQueryPredictor](src/loader/leyyo-query-predictor.ts) |
| `lazy`     | [leyyoQueryLazy](src/loader/leyyo-query-lazy.ts)         |

## Dependencies
- `@leyyo/common` - *common*

## Standards
- Language: `TS`
- Eslint: `Yes`
- Static Code Analysis: `Yes` *IntelliJ Code Inspections*
- DDD - Document Driven: `Yes`
- DDD - Domain Driven: `Yes`
- EDD - Exception Driven: `Yes`
- TDD - Test Driven: `Yes`
- LDD - Log Driven: `Yes`
- 12FA - 12 Factor-App: `50%` *Partially*

## Dependencies
### NO

---
### Prepared by
- Mustafa Yelmer
- mustafayelmer(at)gmail.com
- `2021-03-10`
