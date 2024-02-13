# Storyblok Fieldtype for Optimizely

This fieldtype will call the Optimizely API to get the experiments and variations for you to select.

1. Copy and paste the content of Fieldtype.js into the online plugin editor
2. Add the options projectId (Optimizely project id) and token (Oauth token of read only user)

![Optimizely](https://a.storyblok.com/f/88751/1445x947/6dea23bf42/abtest.png)

## API changes

Optimizely has sunset [the full-stack experimentation](https://storyblok.atlassian.net/browse/SD-3296?focusedCommentId=73638). The `/v2/experiments` API now returns different responses for legacy projects and modern projects.

The important change for us is the `key` property that no longer exist.

The legacy response includes `key` for each experiment object, and for each variation object.

```
// old experiments
[
  {
    "allocation_policy": "manual",
    "audience_conditions": "everyone",
    "campaign_id": 20929000729,
    "changes": [],
    "created": "2021-11-12T10:50:11.234272Z",
    "description": "New CTA should generate more CTR",
    "earliest": "2021-11-15T09:39:00.553817Z",
    "environments": {
      "production": {
        "environment_id": 14840380127,
        "environment_name": "Production",
        "status": "running",
        "percentage_included": null
      }
    },
    "id": 20921170381,
    "is_classic": false,
    "key": "cta_experiment",
    "last_modified": "2021-11-15T09:39:00.648275Z",
    "metrics": [
      {
        "aggregator": "sum",
        "event_id": 0,
        "field": "revenue",
        "scope": "visitor",
        "winning_direction": "increasing"
      }
    ],
    "name": "CTA Experiment",
    "page_ids": [],
    "project_id": 14833890468,
    "status": "running",
    "traffic_allocation": 5000,
    "type": "a/b",
    "variations": [
      {
        "actions": [],
        "archived": false,
        "description": "Variation with a simple text",
        "key": "cta_simple",
        "name": "Simple CTA",
        "status": "active",
        "variation_id": 20917390425,
        "weight": 5000
      },
```

The modern response no longer include them. So we need to fall back to `id` of experiment and `variation_id` of variation.

```
{
  "allocation_policy": "manual",
  "audience_conditions": "everyone",
  "campaign_id": 20368011797,
  "changes": [],
  "created": "2021-06-21T09:20:30.513743Z",
  "description": "Reduce page load above the fold by removing the carousel and replacing with a static image",
  "holdback": 0,
  "id": 20358831687,
  "is_classic": false,
  "last_modified": "2022-04-01T16:00:03.599063Z",
  "metrics": [],
  "name": "La Mer Homepage Carousel Optimisation",
  "project_id": 20350670850,
  "status": "archived",
  "traffic_allocation": 10000,
  "type": "a/b",
  "url_targeting": {
    "activation_type": "immediate",
    "conditions": "[\"and\", [\"or\", {\"match_type\": \"simple\", \"type\": \"url\", \"value\": \"https://www.cremedelamer.com/\"}]]",
    "edit_url": "https://www.cremedelamer.com/",
    "key": "20350670850_url_targeting_for_la_mer_homepage_carousel_optimisat",
    "page_id": 20368032741
  },
  "variations": [
    {
      "actions": [],
      "archived": false,
      "name": "Original - Carousel",
      "status": "active",
      "variation_id": 20352511963,
      "weight": 5000
    },
```
