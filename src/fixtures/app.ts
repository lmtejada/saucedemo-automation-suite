import { test as base, mergeTests, request } from '@playwright/test';

import { test as commonFixtures } from '@fixtures/helpers/common';
import { test as pageObjectFixtures } from '@fixtures/pom/page-objects';

const test = mergeTests(pageObjectFixtures, commonFixtures);
const expect = base.expect;

export { test, expect, request };
