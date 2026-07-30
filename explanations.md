# Explanations of scripts and where to go to change things on the page

## Project structure 

```
map_transport_berlin/
├──css_style/
|      ├──style.css
|      └──style2.css
|
├──data/
|      ├──all_verkehrsmengen_2023_new.geojson
|      ├──sites_mit_demographics_bereinigt_v2.geojson
|      └──tel_all_years.geojson
|
├──js/
|      ├──buttons.js
|      ├──color.js
|      ├──config.js
|      ├──data.js
|      ├──label_in_line.js
|      ├──language.js
|      ├──layers.js
|      ├──legend.js
|      ├──main.js
|      ├──panels.js
|      ├──state.js
|      ├──timeline.js
|      └──tooltip.js
|   
├──index.html
├──more_info.html
├──telraam_doc.md
└──README.md


```

## Which script to modify for what purpose 

### Changing the name of a button/text on the map

If you want to modify text or button's name that does not change while the map runs (on right panel, depending on the segment selected, the text change), [open index.html](index.html). Then you can find the button or text that needs to be changed. Since the script is bit long, search directly the current text you want to change.  

If you want to modify the text on right panel (e.g "Fahrräder:", "Straße:" ), [open panels.js](js/panels.js). In function renderPanel, starting from line 30 

### Changing the data 

** Step 1 ** Import the new file inside [data](/data)
** Step 2 ** Change the name of the file inside [data.js](js/data.js) (It must be geojson). The names of values inside the new file must match with the one that are defined in [config.js](js/config.js), line 26 and in [panels.js](js/panels) line 50 for the survey. 

### Changing colors, police, size....

All style effects can be changed inside [style.css](css_style/style.css) for main page (linked with index.html) and style_2.css. Chekc the id or class of the object you want change something (e.g in index.html line 20, the div is called "left-panel", to change the background color, go to left-panel in style.css and change background (line 19)). 

Sometime, for the topics of the survey, the style is directly put inside the html. 
Same for the points of the survey, the color can be directly changed in html.
