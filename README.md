# Payyit-web

## How to setup :

### Configure ssh

1. We strongly recomment working with git using ssh
1. On gitlab it can be done from profile setting -> ssh keys (https://gitlab.com/profile/keys)
1. Here you will find instruction to generate new key (https://gitlab.com/help/ssh/README#generating-a-new-ssh-key-pair)
1. Create ssh keys using the provided email only. Don't use your personal email id

### Configure workspace

1. Take a clone of the project using command `git clone <repo url>`
1. You must configure your workspace to use your name and email on all your commits
1. Set your name `git config user.name "FirstName LastName"`
1. Set your email `git config user.email "Email"`
1. Latest code is available on master although you must not work on master branch. Also note that you can not push anything on master branch as its protected.
1. Follow branching guidelines to know more about how to contribute


### Configure Linter
- Install eslint plugin in your editor
- Press `CTRL + SHIFT + P` and search `fixable` and select `ESLint: Fix all auto-fixable problems to fix issues in a file`

### Environment

There is a file called ` .env.example` please change it `.env`. and you can put your app secret in that file, Make sure you follow this syntax to create an environment variable `REACT_APP_<secret>`. and then you can access those secrets anywhere in the app from the process object.

Example: `process.env.REACT_APP_BASE_URL`

### Installing dependencies
1. This projects uses Node js runtime environment with the version `22.11.0`.
1. Install Node js `v22.11.0` and yarn in your system. Refer Link `https://nodejs.org/en/download/`
1. Go to root of project directory
1. Enable corepack `corepack enable`
1. Then, you can install the correct Yarn version specified in your project:
`corepack prepare yarn@4.6.0 --activate`
1. Set yarn version `yarn set version 4.6.0`
1. To install all dependencies run command `yarn i`
1. If you intend to point your local frontend env with dev environment of backend then use command `yarn start`
1. If you are running api code on local machine and wants to connect frontend code with local env of backend code then use `yarn run local`
1. This should start local frontend server on `localhost:3000`


## How to deploy :

We use Gitlab CI/CD for auto deployment. It gets triggerred automatically as soon as a new code gets merged into master branch.
Only people with `owner` and `maintainer` role can merge code to `master` branch.

## How to contribute

1. You can't work on master branch. Even if you do, you won't be able to push your code as its protected branch. So never work on master directly.
1. All branch name must be in lowercase
1. We follow different prefixes for different kind of work  
    | Type of task     | branch name          |
    |------------------|----------------------|
    | For new features | `features/<jira-id>` |
    | For bug fix      | `bugfix/<jira-id>`   |
    | For hotfix       | `hotfix/<jira-id>`   |
1. For each task you need to create separate branch and once task finishes raise PR from your branch to `master`
1. Ensure you assign PR for review
1. Ensure no unnecessary logs are placed. If it is there remove it
1. Get followup with your reviewer to get your PR reviewed.
1. Its your responsibility to get PR merged, deployed & tested.

## How to deploy to test
To know how deployment are working take a look at `.gitlab-pipeline.yml`, `firebase.json` & `.firebaserc`

### How to trigger testing pipeline
- Push a commit or tag(preferred) that starts with `test-`, you can use the following command to create a deployment on testing enviromnent.

```bash
git tag -a test-v1.3 - m "Test deplyment v1.3" # Make sure you are changing test-v1.3 everytime to create a new tag
git push origin --tags
```
