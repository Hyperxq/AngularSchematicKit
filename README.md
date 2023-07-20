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
            * [Interface Name: FolderStructure](#interface-name-folderstructure)
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

### Problem to solve?

Having a reliable scaffolding architecture that suits to your project is beneficial. Typically, whenever you start a new
project, you have to manually create the same scaffolding structure. However, with this schematic, you can automate the
creation of your personalized architecture. Alternatively, you can opt for a pre-defined default structure for
implementation.

### Options when you execute the schematic

1. **Select a Scaffold structure:** select defaults o kindArchitecture scaffold pattern.
2. **Write the relative project url:** if you have many projects in the same workspace you need to write for example:
   projects/secondary-application.
3. **Write the url of your files structure file json:** By default, the system will search in the root of the workspace
   the file _customStructure.json_. Remember that when you create this json file you need to create inside the project.
   If you write an url that is outside you will see an error.

### Structure of JSON File

#### Custom Structure File

WorkspaceStructure

| Attribute      | Type         | Optional | Description                               |
|----------------|--------------|:---------|-------------------------------------------|
| globalSettings | {key: value} | true     | Global flags/configuration for components |
| projects       | Project[]    | false    |                                           |

Project

| Attribute | Type              | Optional |
|-----------|-------------------|:---------|
| name      | string            | false    |
| structure | FolderStructure[] | false    |

FolderStructure

| Attribute    | Type                     | Optional | Description                                    |
|--------------|--------------------------|:---------|:-----------------------------------------------|
| name         | string                   | false    |                                                |
| hasModule    | boolean                  | true     |                                                |
| hasShortPath | boolean                  | true     |                                                |
| hasRouting   | boolean                  | true     |                                                |
| children     | Array of FolderStructure | true     |                                                |
| addComponent | {key: value}             | true     | Add all the flags that the component will need |

It's very important to mention that this file is an array of FolderStructure interfaces. You can see and example here:
[Custom JSON File](docs/customStructure.json).

## Add Linters schematic

<code>ng g @danils/schematicskit:add-linters</code> or <code>ng g @danils/schematicskit:l</code>

### Problem to solve?

If you work on a team you need to make the code standards for this reason formatters and linters are needed.
This schematic allows you to immediately configure Prettier and EsLint to your project.

## Add GitHooks schematic

<code>ng g @danils/schematicskit:add-git-hooks</code> or <code>ng g @danils/schematicskit:gh</code>

This schematic allows you to install husky and set all the configuration needed.
