import type { Link, Area } from "./models";

export function generateLinks(
  minDistance: number,
  maxDistance: number,
): Link[] {
  const step = 12;
  const generatedData: Link[] = [];

  for (
    let distance = minDistance;
    distance <= maxDistance - step;
    distance += step
  ) {
    // NOSONAR - pseudorandom is acceptable for test data generation
    // eslint-disable-next-line no-restricted-properties
    const isConnected = Math.random() > 0.25; // 75% probabilidad conectado

    if (isConnected) {
      generatedData.push({
        draft: distance,
        core: distance + step,
        // NOSONAR
        // eslint-disable-next-line no-restricted-properties
        reviewed: Math.random() > 0.95,
      });
    } else {
      // NOSONAR
      // eslint-disable-next-line no-restricted-properties
      const isDraftNull = Math.random() > 0.5;
      if (isDraftNull) {
        generatedData.push({
          draft: distance,
          core: null,
          // NOSONAR
          // eslint-disable-next-line no-restricted-properties
          reviewed: Math.random() > 0.9,
        });
      } else {
        generatedData.push({
          draft: null,
          core: distance + step,
          // NOSONAR
          // eslint-disable-next-line no-restricted-properties
          reviewed: Math.random() > 0.9,
        });
      }
    }
  }
  return generatedData;
}

export function canExtendLinkedArea(
  data: Link[],
  index: number,
  consecutiveDisconnected: number,
): boolean {
  const current = data[index];
  const isPreviousConnected =
    index > 0 &&
    data[index - 1].draft !== null &&
    data[index - 1].core !== null;
  const isNextConnected =
    index + 1 < data.length &&
    data[index + 1].draft !== null &&
    data[index + 1].core !== null;

  if (
    isPreviousConnected &&
    isNextConnected &&
    current.reviewed &&
    consecutiveDisconnected === 1
  ) {
    return true; // unconnected reviewed between two connected links can be part of the linked area
  }

  return false; // all other unconnected items (reviewed: false) must be part of unlinked areas
}

export function extendLinkedArea(
  data: Link[],
  startIndex: number,
  linkedArea: Area,
): number {
  let i = startIndex;
  let consecutiveDisconnected = 0;

  while (i < data.length) {
    const next = data[i];
    const nextConnected = next.draft !== null && next.core !== null;

    if (nextConnected) {
      consecutiveDisconnected = 0;
      linkedArea.draftMax = next.draft!;
      linkedArea.coreMax = next.core!;
      i++;
    } else if (canExtendLinkedArea(data, i, consecutiveDisconnected + 1)) {
      consecutiveDisconnected++;
      linkedArea.draftMax = next.draft ?? linkedArea.draftMax;
      linkedArea.coreMax = next.core ?? linkedArea.coreMax;
      i++;
    } else {
      break;
    }
  }

  return i;
}

export function calculateLinkedAreas(data: Link[]): Area[] {
  const linkedAreasResult: Area[] = [];
  let i = 0;

  while (i < data.length) {
    const current = data[i];
    const isFullyConnected = current.draft !== null && current.core !== null;

    if (!isFullyConnected) {
      i++;
      continue;
    }

    const linkedArea: Area = {
      draftMin: current.draft!,
      coreMin: current.core!,
      draftMax: current.draft!,
      coreMax: current.core!,
    };

    i = extendLinkedArea(data, i + 1, linkedArea);
    linkedAreasResult.push(linkedArea);
  }

  return linkedAreasResult;
}

export function calculateUnlinkedAreas(
  linkedAreasResult: Area[],
  minDistance: number,
  maxDistance: number,
): Area[] {
  const unlinkedAreasResult: Area[] = [];

  // init gap if the first linked area doesn't start at minDistance
  if (
    linkedAreasResult.length > 0 &&
    linkedAreasResult[0].draftMin > minDistance
  ) {
    unlinkedAreasResult.push({
      draftMin: minDistance,
      coreMin: minDistance,
      draftMax: linkedAreasResult[0].draftMin,
      coreMax: linkedAreasResult[0].coreMin,
    });
  }

  // Gaps between linked areas
  for (let j = 0; j < linkedAreasResult.length - 1; j++) {
    const currentEnd = linkedAreasResult[j];
    const nextStart = linkedAreasResult[j + 1];

    unlinkedAreasResult.push({
      draftMin: currentEnd.draftMax,
      coreMin: currentEnd.coreMax,
      draftMax: nextStart.draftMin,
      coreMax: nextStart.coreMin,
    });
  }

  // Final gap if it exists
  const lastLinked = linkedAreasResult.at(-1);
  if (lastLinked && lastLinked.coreMax < maxDistance) {
    unlinkedAreasResult.push({
      draftMin: lastLinked.draftMax,
      coreMin: lastLinked.coreMax,
      draftMax: maxDistance,
      coreMax: maxDistance,
    });
  }

  return unlinkedAreasResult;
}

export function createData(minDistance: number, maxDistance: number) {
  const generatedData = generateLinks(minDistance, maxDistance);
  const linkedAreasResult = calculateLinkedAreas(generatedData);
  const unlinkedAreasResult = calculateUnlinkedAreas(
    linkedAreasResult,
    minDistance,
    maxDistance,
  );

  return {
    data: generatedData,
    linkedAreas: linkedAreasResult,
    unlinkedAreas: unlinkedAreasResult,
  };
}

export function getLinkColor(link: Link): string {
  if (link.core !== null && link.draft !== null) {
    return "steelblue";
  }
  const color = link.reviewed ? "black" : "red";
  console.log(link, color);
  return color;
}
