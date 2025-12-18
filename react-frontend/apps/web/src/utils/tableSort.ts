import type { Order } from "../types/users";

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const av = (a as any)[orderBy];
  const bv = (b as any)[orderBy];
  if (bv < av) return -1;
  if (bv > av) return 1;
  return 0;
}

export function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(
  array: T[],
  comparator: (a: T, b: T) => number
): T[] {
  const stabilized = array.map((el, index) => [el, index] as const);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}
