# CI/CD Pipeline for a Web Application

A complete, working CI/CD project. A small Node.js (Express) task-manager web app is
automatically linted, tested, scanned, containerised with Docker, and deployed to
staging and production using GitHub Actions (a Jenkinsfile is included as an alternative).

## 1. Objective
Automate the path from a developer's `git push` to a running production system so that
releases are fast, repeatable, and safe.

## 2. Architecture

```
Developer -> Git push -> GitHub
                           |
             +-------------v--------------+
             |        CI  (automatic)      |
             | Lint -> Test -> Security    |
             | scan -> Docker build & push |
             +-------------+---------------+
                           |  image in GHCR registry
             +-------------v---------------+
             |        CD                   |
             | Staging -> Smoke test ->    |
             | Manual approval ->          |
             | Production -> Health check  |
             |  (auto rollback on failure) |
             +-----------------------------+
```

## 3. Technology stack
| Purpose | Tool |
|---|---|
| Application | Node.js + Express |
| Version control | Git + GitHub |
| CI/CD engine | GitHub Actions (alt: Jenkins) |
| Testing | Jest + Supertest |
| Code quality | ESLint |
| Security | npm audit, Trivy |
| Containerisation | Docker (multi-stage build) |
| Registry | GitHub Container Registry (GHCR) |
| Deployment | SSH + Docker, with health-check rollback |

## 4. Project structure
```
cicd-project/
|-- src/app.js, server.js        Application code
|-- public/index.html            Frontend
|-- tests/app.test.js            Automated tests
|-- Dockerfile, .dockerignore    Container build
|-- docker-compose.yml           Local run
|-- scripts/deploy.sh            Deploy + health check + rollback
|-- .github/workflows/ci-cd.yml  GitHub Actions pipeline
|-- Jenkinsfile                  Jenkins alternative
|-- docs/VIVA_QA.md              Evaluation questions and answers
```

## 5. Branching strategy
- `feature/*` -> pull request -> `develop` (deploys to **staging**)
- `develop` -> pull request -> `main` (deploys to **production** after approval)
- Pull requests run CI only (lint, test, scan) and never deploy.

## 6. Pipeline stages
| # | Stage | What it does | Fails the build if |
|---|---|---|---|
| 1 | Checkout | Gets the code | - |
| 2 | Install | `npm install` | install error |
| 3 | Lint | ESLint | style or code errors |
| 4 | Test | Jest, coverage >= 80% | a test fails or coverage drops |
| 5 | Security scan | `npm audit`, Trivy image scan | high-severity vulnerabilities |
| 6 | Docker build and push | Image tagged with commit SHA | build error |
| 7 | Deploy staging | SSH + `deploy.sh` | unhealthy container |
| 8 | Smoke test | `curl /health` | non-200 response |
| 9 | Approval gate | Required reviewer on `production` environment | rejected |
| 10 | Deploy production | Same script, port 80 | unhealthy, then auto rollback |

## 7. Run it locally
```bash
npm install
npm run lint
npm test
npm start                    # http://localhost:3000

# or with Docker
docker compose up --build
```

## 8. Set up the pipeline on GitHub
1. Create a repository and push this project to it.
2. **Settings -> Environments**: create `staging` and `production`. On `production`, enable **Required reviewers** (this is the manual approval gate).
3. **Settings -> Secrets and variables -> Actions**, add:
   - `STAGING_HOST`, `PROD_HOST` : server IP addresses
   - `SSH_USER`, `SSH_KEY` : SSH login for the servers
4. On each server: install Docker and copy `scripts/deploy.sh` to the home folder.
5. Push to `develop`, then merge to `main`, and watch the **Actions** tab.

If you have no servers, you can still demonstrate stages 1-6 (CI and image build), which need no secrets.

## 9. Key concepts used
- **Continuous Integration:** every push is built and tested automatically.
- **Continuous Delivery:** every build that passes is releasable, with a manual approval before production.
- **Immutable artefacts:** each image is tagged with the commit SHA, so what was tested is exactly what is deployed.
- **Rollback:** `deploy.sh` restores the previous image if the new one fails its health check.
- **Shift-left security:** dependency and image scans run before deployment.

## 10. Possible improvements
Blue-green or canary deployment on Kubernetes, Prometheus and Grafana monitoring, Slack alerts on failure, end-to-end tests with Cypress, infrastructure as code with Terraform.
