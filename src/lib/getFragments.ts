import { DefinitionNode, Kind } from 'graphql';
import type { FragmentMapping } from './types';

export const getFragments = (
  definitions: ReadonlyArray<DefinitionNode>
): FragmentMapping => {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      const value = definition.name.value;
      map[value] = definition;
    }

    return map;
  }, {} as FragmentMapping);
};
