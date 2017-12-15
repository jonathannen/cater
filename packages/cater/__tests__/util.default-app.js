// Copyright Jon Williams 2017. See LICENSE file.

// Will throw an (intended) error defined in app/App. Needed as it's own 
// file as a regular require skips the usual Babel import rules. So we 
// require this file instead.
import 'app/App';