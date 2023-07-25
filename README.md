# Angular Schematics Kit Documentation

Welcome to the Angular Schematic Kit npm library! This is your go-to resource for simple, yet incredibly powerful
schematics, expertly designed to transform your Angular project setup process into a smooth sail. We understand that
initiating a new project often means retracing the same steps, which can be quite time-consuming. That's exactly why
each schematic in this library is geared towards automating and customizing configurations to align perfectly with your
project's specific needs. But it doesn't stop there! This library thrives on evolution and growth, so your contributions
towards enhancing existing schematics or creating new ones are more than welcome. Dive in, enjoy the simplicity and
power of our library, and remember—happy coding! 🎉

## How to use this schematics' package

<code>ng add @danils/schematicskit</code>

When you have already installed the pattern to execute any schematics is:
<code>ng g @danils/schematicskit:[schematic-name]</code>

* [🚀 Angular Schematics Kit Documentation](#angular-schematics-kit-documentation)
    * [How to use this schematics package](#how-to-use-this-schematics-package)
    * [🕙 Initialize angular configuration schematic](#initialize-angular-configuration-schematic)
        * [Problem to solve?](#problem-to-solve)
    * [🕙 Scaffolding schematic](#scaffolding-schematic)
        * [Problem to solve?](#problem-to-solve-1)
        * [Options when you execute the schematic](#options-when-you-execute-the-schematic)
        * [Structure of JSON File](#structure-of-json-file)
            * [Interface Name: FolderStructure](#custom-structure-file)
    * [🕙 Add Linters schematic](#add-linters-schematic)
        * [Problem to solve?](#problem-to-solve-2)
    * [🕙 Add GitHooks schematic](#add-githooks-schematic)

## Initialize angular configuration schematic

<code>ng g @danils/schematicskit:initialize-angular-configuration</code> or
<code>ng g @danils/schematicskit:start</code>

### Problem to solve?

Upon reviewing the documentation, you might desire a schematic that can execute all other schematics included in this
kit. For such instances, this specific schematic has been designed to fulfill that purpose.

## Scaffolding schematic

<code>ng g @danils/schematicskit:scaffolding</code> or <code>ng g @danils/schematicskit:s</code>

Example here:
[Custom JSON File](docs/customStructure.json).

### Problem to solve?

Having a reliable scaffolding architecture that suits to your project is beneficial. Typically, whenever you start a new
project, you have to manually create the same scaffolding structure. However, with this schematic, you can automate the
creation of your personalized architecture. Alternatively, you can opt for a pre-defined default structure for
implementation.

**Notes:** Now you can call external schematics inside the scaffolding. You only need to specify the schematic name and
set the configuration.
The ability to call every external schematic is so powerful.
If you don't specify the collection by default, it will find into **@angular/schematics**.

This schematic will send the configuration that you set in global settings or in the specified configuration.
Additionally, It will send the path base on the 'json.'
<Br/>
If you don't specify the name attribute, it will take the folder name.
For example:

```json
{
  "name": "dialog",
  "component": [
    {
      "name": "dialog-special"
    }
  ],
  "navigation": {
    "collection": "@angular/material",
    "name": "navigation",
    "standalone": true
  }
}
```

### Options when you execute the schematic

1. **Select a Scaffold structure:** select defaults o kindArchitecture scaffold pattern.
2. **Write the relative project url:** if you have many projects in the same workspace, you need to write, for example,
   projects/secondary-application.
   **If you don't select a custom scaffold structure, you can press enter.**
3. **Write the url of your files structure file json:** By default, the system will search in the root of the workspace
   the file _customStructure.json_. Remember that when you create this json file you need to create inside the project.
   If you write an url that is outside, you will see an error. **If you don't select a custom scaffold structure you can
   press enter.**

### Structure of JSON File

**WorkspaceStructure**

| Attribute      | Type                                         | Optional | Description                                                                                                                           |
|----------------|----------------------------------------------|:---------|---------------------------------------------------------------------------------------------------------------------------------------|
| globalSettings | [option: string]: { [prop: string]: string } | true     | Global flags/configuration for schematics using the schematic name, <br/>you can specify the collection with the the flag: collection |
| projects       | Project[]                                    | false    |                                                                                                                                       |

**Project**

| Attribute | Type              | Optional |
|-----------|-------------------|:---------|
| name      | string            | false    |
| structure | FolderStructure[] | false    |

**FolderStructure**

| Attribute                | Type                                                                         | Optional | Description                                                                                                                                                       |
|--------------------------|------------------------------------------------------------------------------|:---------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name                     | string                                                                       | false    |                                                                                                                                                                   |
| hasShortPath             | boolean                                                                      | true     |                                                                                                                                                                   |
| hasRouting               | boolean                                                                      | true     |                                                                                                                                                                   |
| children                 | Array of FolderStructure                                                     | true     |                                                                                                                                                                   |
| [externalSchematicsName] | [option: string]: { [prop: string]: string } or { [prop: string]: string }[] | true     | Use the schematic name only to set the configuration for this schematic <br/>or an array to execute many times this schematics <br/>with different configurations |

## Add Linters schematic

<code>ng g @danils/schematicskit:add-linters</code> or <code>ng g @danils/schematicskit:l</code>

### Problem to solve?

If you work on a team, you need to make the code standards for this reason formatters and linters are needed.
This schematic allows you to immediately configure Prettier and EsLint to your project.

## Add GitHooks schematic

<code>ng g @danils/schematicskit:add-git-hooks</code> or <code>ng g @danils/schematicskit:gh</code>

This schematic allows you to install husky and set all the configuration needed.
