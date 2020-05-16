#!/usr/bin/env node

let program = require('commander'),
    dotenv = require('dotenv');

dotenv.config();

require('../libs/colors');
require('../tasks/snippets');

program.parse(process.argv);
