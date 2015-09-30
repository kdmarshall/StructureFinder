# StructureFinder
### A Google Chrome extension that aggregates chemical data

This extension has two main features: 

First is the 'Compound Search' component. This feature accepts any kind of compound name, 
including IUPAC, catalog names, CAS, drug common and proprietary names. If found, the returned info includes a list of synonyms, a PubChem link, the compound's SMILES, a list of PubMed articles and patents the compound can be found in and the 2D structure's image.

The second feature is the 'Literature Search' component. This feature accepts PubMed IDs and patent numbers and
in return will search for all the compounds in those publications. If found, each compound's image, name,
SMILES, and a PubChem link will be shown. This data can then be downloaded into a CSV.

To install:
1. Clone repo to local computer
2. Open up your Chrome extension's page
3. Check 'Developer mode'
4. Click 'Load unpacked extension' and select the StructureFinder folder on your computer

