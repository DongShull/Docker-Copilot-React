# Third-party notices

The optional automatic application-icon catalog uses metadata and PNG assets
from [homarr-labs/dashboard-icons](https://github.com/homarr-labs/dashboard-icons),
licensed under the Apache License 2.0. The catalog index is generated from the
pinned revision recorded in `src/config/iconCatalog.generated.json`; runtime
asset URLs use that same immutable revision.

A copy of the license is included at
`licenses/dashboard-icons-APACHE-2.0.txt`.

Docker Copilot does not send full private repository paths to the catalog host.
Only a matched public catalog slug is requested by the browser. Unknown images
use a locally generated deterministic fallback and make no external request.
