[![Build Status](https://travis-ci.com/eeshangarg/COMP4770.svg?token=QShBcTiKKJroZPan48rz&branch=master)](https://travis-ci.com/eeshangarg/COMP4770)

# COMP-4770
COMP 4770 Team Project

This project is okay.

## Setting up a development environment

1. Make sure you have `node`, `npm`, and `git` installed.

1. Fork the Git repository for this project. Clone your fork:

    `git clone https://github.com/<your_username>/COMP4770`

    Make sure you replace `<your_username>` with your GitHub username.

1. Type: `cd COMP4770/`.

1. Add the original repo as the `upstream` repository:

    `git remote add upstream https://github.com/eeshangarg/COMP4770`

1. Make sure your local repo is in sync with `upstream`:

    ```
    git fetch upstream
    git rebase upstream/master
    git push origin master
    ```

    You can run these commands every time you want to make sure that
    your local repo is in sync with the upstream repo. It is recommended
    that you run these commands as often as possible to stay up to date
    with all changes in the project.

1. Finally, set up the development environement by running:

    `npm install .`

1. To test the environment, run all tests by running:

    `./tools/test-all`

    In the future, no changes that break `./tools/test-all` will be merged.

### Running test processes separately

To run linting, use `npm run lint`.

To run the tests and produce coverage stats, use `npm run test`.

To run the Flow JS static type-checker, use `npm run flow`.
