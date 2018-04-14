# (⊙_☉) mediaclerk

A Docker Image for running scheduled media / file collation jobs.

Backed by the [fileclerk](https://www.npmjs.com/package/fileclerk) npm library

## Running

You should map any directories you wish to use as source or target paths as volumes on the running container.

You must also map a configuration file from the host to ```/config/mediaclerk.json``` on the container.

The contents of this file are an array of JSON objects representing individual job configurations. Any values in the ```sourcePath``` or ```targetPath``` properties should correspond to paths that have been mapped from the host to the container (referencing the path in the context of the container volume).

Example:

```
[{
  "name": "Picture Cleanup Job",
  "cronTime": "*/15 * * * *",
  "sourcePath": "/INCOMING/Pictures",
  "targetPath": "/Pictures",
  "byDate": {
    "dateFormat": ["YYYY", "YYYY-MM-DD"],
    "timeZone": "America/Denver"
  },
  "fileType": "image",
  "options": {
    "excludes": "\\..*/"
  }
},
{
  "name": "Video Cleanup Job",
  "cronTime": "*/15 * * * *",
  "sourcePath": "/INCOMING/Videos",
  "targetPath": "/Videos",
  "byDate": {
    "dateFormat": ["YYYY", "YYYY-MM-DD"],
    "timeZone": "America/Denver"
  },
  "fileType": "video",
  "options": {
    "excludes": "\\..*/"
  }
}]
```

## Documentation

TODO: Write docs
