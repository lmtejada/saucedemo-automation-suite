import { test as base, mergeTests, request } from '@playwright/test';

import { test as commonFixtures } from './helpers/common';
import { test as pageObjectFixtures } from './pom/page-objects';

const test = mergeTests(pageObjectFixtures, commonFixtures);
const expect = base.expect;

export { test, expect, request };
