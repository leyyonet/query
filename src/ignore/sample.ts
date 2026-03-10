import { queryParser } from "../items/index.js";
import { StrKey } from "@leyyo/common";

interface Entity {
  name: string;
  description: string;
  id: number;
}
type S = "lowerName" | "upperName";
type A = "a";
type F = StrKey<Entity>;

const keys: Array<F> = ["name", "description"];
const aliases: Array<A> = ["a"];

// region select
queryParser.exec<F, A, S>(
  {
    select: "*",
  },
  keys,
  aliases,
);
// endregion select
// region where
// endregion where
// region group by
// endregion group by
// region order by
// endregion order by

queryParser.exec<F, A, S>(
  {
    select: ["id", "a.name"],
    where: [{ field: "a.name", op: "eq", value: "Ali" }],
  },
  keys,
  aliases,
);

queryParser.exec<F, A, S>(
  {
    select: [
      ["a.id", "id"],
      ["a.name", "name"],
      ["lowerName", "name"],
    ],
  },
  keys,
  aliases,
);

queryParser.exec<F, A, S>(
  {
    select: [
      { field: "a.id", as: "id" },
      { field: "lowerName", as: "low" },
      { raw: "UPPER(a.name)", as: "upp" },
    ],
    shortcut: { lowerName: "LOWER(a.id)" },
  },
  keys,
  aliases,
);

queryParser.exec<F, A, S>(
  {
    select: [{ raw: "LOWER(a.id)", as: "low" }],
  },
  keys,
  aliases,
);

queryParser.exec<F, A, S>(
  {
    where: {
      name: "ali",
      description: "veli",
    },
  },
  keys,
  aliases,
);
