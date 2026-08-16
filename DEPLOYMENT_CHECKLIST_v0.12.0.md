# Merchant Admin v0.12.0 deployment checklist

1. Deploy Shop Backend v0.14.0 and apply migration 015 first.
2. Deploy Merchant Admin v0.12.0.
3. In Store Settings configure the exact Luke CS Chat HTTPS URL and platform route key.
4. In Customer Service create an AI credential with only the read scopes/tools needed by Luke CS.
5. Copy the credential once into Luke CS Platform Control Center → Shop Commerce; never put it in Customer Web or a browser environment variable.
6. Runtime-test credential revoke/rotate and least-privilege policy.
