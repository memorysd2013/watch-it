# Git History Cleanup Guide

**Note**: This PR removes secrets from the working tree but does NOT rewrite git history on main. Evan will handle main history cleanup separately.

## Secret-Bearing Files Found in Git History

Based on `git log --all --name-only -- '.env*'`:

### Files to Purge from History

1. `.env.prod` - Contains:
   - VAPID_PRIVATE_KEY
   - CRON_SECRET
   - VITE_ALPHA_VANTAGE_API_KEY
   - VITE_VAPID_PUBLIC_KEY
   - Contact email

2. `.env.local.backup` - Contains:
   - VAPID_PRIVATE_KEY (different from .env.prod)
   - CRON_SECRET (different from .env.prod)
   - VITE_ALPHA_VANTAGE_API_KEY
   - VITE_FREECURRENCY_API_KEY
   - VITE_VAPID_PUBLIC_KEY (different from .env.prod)
   - Contact email

### Git Commits Containing Secret Files

On main branch:
- `7558c54` - fix safari env
- `86757b4` - fix safari sub issue
- Plus the commit from THIS PR that removed them from tree

## Keys Requiring Immediate Rotation

**All keys listed above must be rotated immediately:**

1. **VAPID_PRIVATE_KEY** - Two different keys exposed
2. **VAPID_PUBLIC_KEY** - Two different keys exposed
3. **CRON_SECRET** - Two different secrets exposed
4. **VITE_ALPHA_VANTAGE_API_KEY** - One key exposed (feature removed)
5. **VITE_FREECURRENCY_API_KEY** - One key exposed (feature removed)

### How to Generate New Keys

1. **VAPID Keys**
   ```bash
   pnpm generate-vapid
   # Or: npx web-push generate-vapid-keys
   ```

2. **CRON_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Alpha Vantage API Key** (feature removed, but key should be revoked)
   - Revoke at: https://www.alphavantage.co/

4. **FreeCurrency API Key** (feature removed, but key should be revoked)
   - Revoke at: https://app.freecurrencyapi.com/

## Recommended History Cleanup Commands

**Important**: These commands rewrite git history. All team members must re-clone after running them.

```bash
# Option 1: BFG Repo-Cleaner (faster, easier)
java -jar bfg.jar --delete-files '.env.prod' --delete-files '.env.local.backup' .
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Option 2: git-filter-repo (more control)
git filter-repo --path .env.prod --path .env.local.backup --invert-paths

# After cleanup
git push --force-with-lease --all
git push --force-with-lease --tags
```

## After History Cleanup

1. All team members must re-clone the repository
2. Update Vercel environment variables with new secrets
3. Verify old VAPID keys no longer work for push notifications
4. Update any CI/CD systems with new CRON_SECRET
5. Confirm Alpha Vantage and FreeCurrency keys are revoked
