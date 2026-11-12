# @afges/n8n-nodes-archivebox

> Nœud communautaire n8n pour l'API REST d'ArchiveBox 0.9 — snapshots, tags, résultats d'archivage et ajout d'URLs.
> n8n community node for the ArchiveBox 0.9 REST API — snapshots, tags, archive results and URL ingestion.

[Français](#français) · [English](#english)

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

---

## Français

Nœud communautaire [n8n](https://n8n.io) pour interagir avec l'API REST d'[ArchiveBox](https://archivebox.io)
0.9. ArchiveBox est un outil auto-hébergé d'archivage du web. Ce nœud permet d'ajouter des
URLs à archiver et de lire ou gérer les snapshots, tags et résultats d'archivage directement
dans vos workflows n8n.

Base de l'API : `<votre instance>/api/v1/`.

### Installation

Suivez le [guide d'installation des nœuds communautaires](https://docs.n8n.io/integrations/community-nodes/installation/)
de n8n.

Dans n8n : **Settings → Community Nodes → Install**, puis saisissez le nom du paquet :

```
@afges/n8n-nodes-archivebox
```

Installation manuelle (instance auto-hébergée) :

```bash
npm install @afges/n8n-nodes-archivebox
```

### Identifiants (Credentials)

Le nœud utilise des identifiants **ArchiveBox API** (clé d'API envoyée dans l'en-tête
`X-ArchiveBox-API-Key`).

1. Créez un jeton d'API appartenant à un **superutilisateur** (_superuser_) :
   - dans l'administration, à l'adresse `/admin/api/apitoken/` ; ou
   - via `POST /api/v1/auth/get_api_token` avec un nom d'utilisateur et un mot de passe.
2. Dans n8n, créez des identifiants **ArchiveBox API** et renseignez :
   - **Base URL** : URL de votre instance, **sans** `/api` final (ex. : `http://archivebox:8000`) ;
   - **API Key** : le jeton du superutilisateur ;
   - **Ignore SSL Issues (Insecure)** : option pour se connecter même si le certificat SSL
     ne peut pas être validé (instances auto-hébergées).

Les identifiants sont validés via un appel à `GET /api/v1/core/tags?limit=1`.

### Opérations

| Ressource                                 | Opérations                                                                                  | Description                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Résultat d'archivage** (Archive Result) | Get · Get Many                                                                              | Récupère un résultat par ID ; liste (filtres : plugin, statut, snapshot, tag, URL, hook, dates, recherche…).                 |
| **Snapshot**                              | Change State · Create · Delete · Get · Get Many · Update                                    | Met en pause/reprend/annule ; crée ; supprime (mise en file) ; récupère ; liste (filtres) ; modifie tags, statut ou _retry_. |
| **Tag**                                   | Add to Snapshot · Create · Delete · Get · Get Many · Remove From Snapshot · Rename · Search | Gère les tags et leur association aux snapshots ; recherche avec filtres (créateur, présence de snapshots, tri, année).      |
| **URL**                                   | Add                                                                                         | Ajoute des URLs à archiver (`POST /cli/add`) avec options (profondeur, tags, plugins, parser, persona…).                     |

### Fonctionnalités

- **Pagination** : option _Return All_ pour tout récupérer, ou _Limit_ pour borner le
  nombre de résultats sur les listes.
- **Filtres** : dates, recherche texte, statut, tag, URL, etc. selon la ressource.
- **Ajout en masse** : l'opération URL → Add accepte plusieurs URLs séparées par des
  retours à la ligne ou des virgules.
- Le nœud est utilisable comme **outil** (`usableAsTool`) dans les workflows IA d'n8n.

### Compatibilité

- ArchiveBox **0.9 ou supérieur** ; version cible testée : **v0.9.77**.
- L'API REST amont est signalée comme **alpha** et peut changer.
- ArchiveBox **0.8.x n'est pas pris en charge**.
- API des nœuds n8n version 1, mode `strict`.
- Nécessite une instance n8n prenant en charge les nœuds communautaires.

### Exemple d'utilisation

1. Ajoutez le nœud **ArchiveBox** et sélectionnez vos identifiants.
2. Ressource **URL** → opération **Add**.
3. Saisissez les URLs à archiver et, au besoin, des _Tags_ dans les options.

### Ressources

- [Documentation des nœuds communautaires n8n](https://docs.n8n.io/integrations/community-nodes/)
- [Documentation d'ArchiveBox](https://docs.archivebox.io)
- [Dépôt ArchiveBox](https://github.com/ArchiveBox/ArchiveBox)
- [Dépôt](https://git.afges.eu/n8n/n8n-nodes-archivebox) (miroir [GitHub](https://github.com/AFGES/n8n-nodes-archivebox))

### Historique des versions

Voir [CHANGELOG.md](CHANGELOG.md).

### Licence

[MIT](https://opensource.org/licenses/MIT).

---

## English

[n8n](https://n8n.io) community node for the [ArchiveBox](https://archivebox.io) 0.9 REST API.
ArchiveBox is a self-hosted web archiving tool. This node lets you add URLs to archive and
read or manage snapshots, tags and archive results directly inside your n8n workflows.

API base: `<your instance>/api/v1/`.

### Installation

Follow n8n's [community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In n8n: **Settings → Community Nodes → Install**, then enter the package name:

```
@afges/n8n-nodes-archivebox
```

Manual install (self-hosted instance):

```bash
npm install @afges/n8n-nodes-archivebox
```

### Credentials

The node uses **ArchiveBox API** credentials (API key sent in the `X-ArchiveBox-API-Key`
header).

1. Create an API token that belongs to a **superuser**:
   - in the admin, at `/admin/api/apitoken/`; or
   - with `POST /api/v1/auth/get_api_token` using a username and password.
2. In n8n, create **ArchiveBox API** credentials and fill in:
   - **Base URL**: URL of your instance, **without** a trailing `/api` (e.g. `http://archivebox:8000`);
   - **API Key**: the superuser token;
   - **Ignore SSL Issues (Insecure)**: option to connect even if SSL certificate validation
     is not possible (self-hosted instances).

Credentials are validated with a call to `GET /api/v1/core/tags?limit=1`.

### Operations

| Resource           | Operations                                                                                  | Description                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Archive Result** | Get · Get Many                                                                              | Get a result by ID; list (filters: plugin, status, snapshot, tag, URL, hook, dates, search…).         |
| **Snapshot**       | Change State · Create · Delete · Get · Get Many · Update                                    | Pause/resume/cancel; create; delete (queued); get; list (filters); update tags, status or retry time. |
| **Tag**            | Add to Snapshot · Create · Delete · Get · Get Many · Remove From Snapshot · Rename · Search | Manage tags and their link to snapshots; search with filters (creator, has snapshots, sort, year).    |
| **URL**            | Add                                                                                         | Add URLs to archive (`POST /cli/add`) with options (depth, tags, plugins, parser, persona…).          |

### Features

- **Pagination**: _Return All_ to fetch everything, or _Limit_ to cap the number of
  results on list operations.
- **Filters**: dates, text search, status, tag, URL, etc. depending on the resource.
- **Bulk add**: URL → Add accepts several URLs separated by new lines or commas.
- The node is **usable as a tool** (`usableAsTool`) in n8n AI workflows.

### Compatibility

- ArchiveBox **0.9 or later**; tested target version: **v0.9.77**.
- The upstream REST API is flagged **alpha** and may change.
- ArchiveBox **0.8.x is not supported**.
- n8n nodes API version 1, `strict` mode.
- Requires an n8n instance that supports community nodes.

### Usage example

1. Add the **ArchiveBox** node and select your credentials.
2. Resource **URL** → operation **Add**.
3. Enter the URLs to archive and, if needed, _Tags_ in the options.

### Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [ArchiveBox documentation](https://docs.archivebox.io)
- [ArchiveBox repository](https://github.com/ArchiveBox/ArchiveBox)
- [Repository](https://git.afges.eu/n8n/n8n-nodes-archivebox) ([GitHub](https://github.com/AFGES/n8n-nodes-archivebox) mirror)

### Version history

See [CHANGELOG.md](CHANGELOG.md).

### License

[MIT](https://opensource.org/licenses/MIT).
