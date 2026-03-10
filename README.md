# Leyyo: Query
> Query library for Leyyo framework

## Import
- `npm i @leyyo/query`

## Blueprint

#### Items
| Type        | Name                                                               | Props           | Description      |
|-------------|--------------------------------------------------------------------|-----------------|------------------|
| `instance`  | [queryParser](src/items/query.parser.ts)                           | `f`             | query parser     |
| `error`     | [InvalidQueryValueError](./src/error/invalid-query-value.error.ts) | `f` `p` `e` `i` |                  |
| `literal`   | [OperationType](src/literal/operation-type.ts)                     | `f` `p` `i`     | operation        |
| `literal`   | [OrderType](src/literal/order-type.ts)                             | `f` `p` `i`     | order type       |
| `predictor` | [leyyoQueryPredictor](src/loader/leyyo-query-predictor.ts)         |                 | predictor loader |
| `lazy`      | [leyyoQueryLazy](src/loader/leyyo-query-lazy.ts)                   |                 | lazy loader      |
> Props: `p`: **predictor**, `f`: **FQN**, `e`: **Emit**, `i`: **I18N**

#### Test Cases
| Case                       | Error                  | Message                                                                                          | 
|----------------------------|------------------------|--------------------------------------------------------------------------------------------------|
| `invalid-field`            | InvalidQueryValueError | *Field should be valid text*                                                                     |
| `invalid-raw`              | InvalidQueryValueError | *Raw data should be valid text*                                                                  |
| `min-number`               | InvalidQueryValueError | *It should be %d as minimum*                                                                     |
| `invalid-number`           | InvalidQueryValueError | *Value should be numeric*                                                                        |
| `no-raw-no-field`          | InvalidQueryValueError | *Field or raw are not provided, one of them should be*                                           |
| `both-raw-field`           | InvalidQueryValueError | *Field and raw are provided together, Field or raw are not provided, only one of them should be* |
| `invalid-order-type`       | InvalidQueryValueError | *Order type should be valid*                                                                     |
| `invalid-order-item`       | InvalidQueryValueError | *Invalid order by item*                                                                          |
| `invalid-order-block`      | InvalidQueryValueError | *Invalid order by block*                                                                         |
| `invalid-as`               | InvalidQueryValueError | *As command should be valid text*                                                                |
| `invalid-select-item`      | InvalidQueryValueError | *Invalid select item*                                                                            |
| `invalid-select-block`     | InvalidQueryValueError | *Invalid select block*                                                                           |
| `invalid-operation`        | InvalidQueryValueError | *Operation command should be valid*                                                              |
| `invalid-value`            | InvalidQueryValueError | *Value should not be empty or spaced string*                                                     |
| `invalid-value-type`       | InvalidQueryValueError | *Value should be string, number or boolean*                                                      |
| `invalid-value`            | InvalidQueryValueError | *Value should be valid*                                                                          |
| `invalid-where-item`       | InvalidQueryValueError | *Invalid select item*                                                                            |
| `invalid-where-block`      | InvalidQueryValueError | *Invalid select block*                                                                           |
| `invalid-having-item`      | InvalidQueryValueError | *Invalid having item*                                                                            |
| `invalid-having-block`     | InvalidQueryValueError | *Invalid having block*                                                                           |
| `invalid-group-item`       | InvalidQueryValueError | *Invalid group by item*                                                                          |
| `invalid-group-block`      | InvalidQueryValueError | *Invalid group by block*                                                                         |
| `both-limit-offset`        | InvalidQueryValueError | *If you give page; limit and offset can not be used anymore*                                     |
| `both-page-size`           | InvalidQueryValueError | *If you give limit; page and size can not be used anymore*                                       |
| `no-limit-offset`          | InvalidQueryValueError | *Pagination should have limit/offset or page/size keys*                                          |
| `invalid-pagination-block` | InvalidQueryValueError | *Invalid pagination block*                                                                       |

### Dependencies
| Name               | Framework | Description |
|--------------------|-----------|-------------|
| `@leyyo/common`    | √         |             |


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

---
### Prepared by
- Mustafa Yelmer
- mustafayelmer(at)gmail.com
- `2021-03-10`
