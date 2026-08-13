# Technical Analysis — Admin Web v0.4.1

Client Admin never constructs a draft URL from tenant data alone. It requests `/v1/merchant/customer-experience/preview-token`; Backend binds the token to the authenticated merchant, tenant, store, and DRAFT experience version. The raw token is then used only in the Customer Web preview path.
