# TDM-SCN-Centers-Transit-Strategy-Land-Use

This repo contains the land use calculations used when testing transit strategies for the 2027 RTP. These strategies include additional fixed guideway and bus routes.

**_config.py**: This file contains global objects used throughout the juptyer notebooks.

**1-Prepare-Inputs.ipynb**: This notebook gathers the inputs needed for the scenario from a defined TDM model. These inputs include network link and node shapefiles, taz shapefile, and parsed transit line files.

**2-Prepare-Station-Areas.ipynb**: This notebook defines areas of Wasatch Choice centers that are within 1/2 mile of transit.

**3-Process-REMM-Data.ipynb**: This notebook calculates the area ratios of households and jobs in each station area unioned with TAZ boundaries as compared to whole TAZ, as well as changeable area, which means areas that is not included in the get_condition_no_change function in the _config.py file. At time of this writing that includes all no_build parcels or parcesl with only single-family use or both single-family and multi-family use when no non-residential use. This is to account for difficulty of redeveloping residential uses.

**4-Land-Use-Calcs.ipynb**: This notebook uses the portions calculated in the previous notebook and applies the maximum density for a station area as defined by the center type to generate households and jobs for each station area.

**5-TAZ-SE-Calcs.ipynb**: This notebook creates a final set of SE data to be used in the TDM. The station areas in each respective TAZ are dissolved with their household and jobs aggregated. Redistributing households and jobs for non-station area TAZs is done to maintain country control totals.

**6-Walk-Access-Links.ipynb**: Walk access link distance and time values are weighted by station area polygon densities and the centroid distance to neareast transit station. The result is a single walk-access link to each station with the distance and time weighted to account for higher densities near transit stations.

This methodology was based off https://github.com/WFRCAnalytics/TDM-SCN-Three-Transit-Corridors-Land-Use
