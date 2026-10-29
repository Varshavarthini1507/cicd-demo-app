# Likely Evaluation Questions

**1. What is CI/CD?**
CI automatically builds and tests code on every change. CD automatically delivers (or deploys) the tested build to environments. Together they shorten release time and reduce errors.

**2. Difference between Continuous Delivery and Continuous Deployment?**
Delivery stops at a manual approval before production. Deployment releases to production automatically when all checks pass. This project uses Delivery (approval gate on `production`).

**3. Why Docker?**
It packages the app with its dependencies so it behaves the same on a laptop, in CI, in staging and in production.

**4. Why tag images with the commit SHA?**
It makes every release traceable and rollback easy, and ensures the tested image is the deployed image.

**5. How does rollback work here?**
`scripts/deploy.sh` records the previous image, starts the new one, polls `/health`, and restarts the previous image if the check fails.

**6. Why a staging environment?**
It mirrors production, so problems are caught before real users are affected.

**7. What security checks are included?**
`npm audit` for vulnerable dependencies, Trivy for image vulnerabilities, secrets kept in GitHub Secrets, and the container runs as a non-root user.

**8. Why a multi-stage Dockerfile?**
It keeps build-time layers out of the final image, giving a smaller and safer image.

**9. What triggers the pipeline?**
A push or pull request to `main` or `develop`. Pull requests run CI only.

**10. How would you scale this?**
Move deployment to Kubernetes with rolling or canary releases, add Prometheus/Grafana monitoring and automated alerts.
