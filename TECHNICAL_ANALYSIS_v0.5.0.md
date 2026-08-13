# Technical Analysis v0.5.0

The Admin now sends selected files as raw binary bodies to the Backend asset upload endpoint. Tenant and store context are inherited from the authenticated admin session. Product media may reuse an existing asset, avoiding duplicate uploads.
