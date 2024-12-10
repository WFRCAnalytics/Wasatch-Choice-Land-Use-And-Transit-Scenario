import pandas as pd
import geopandas as gpd
import numpy as np

# variables

df_center_override = pd.DataFrame([], columns=['N','nearest_AreaType'])

# location of tdm for model runs
tdm_path = r'E:\GitHub\WF-TDM-v9x'

# transit files
input_model_line_files_folder = 'input/transit-lin-files'
tdm_model = 'application/v910-strategy-testing-rtp'
tdm_transit_scenarios = ['Lin_2050_BNS','Lin_2050_FG_LB']

# network shapefile
tdm_link_shapefile = 'WFv910_MasterNet - Link.shp'
input_tdm_link_shapefile_folder = 'input/tdm-link-shapefile'
tdm_node_shapefile = 'WFv910_MasterNet - Node.shp'
input_tdm_node_shapefile_folder = 'input/tdm-node-shapefile'

# taz shapefile
taz_shapefile = 'WFv900_TAZ.shp'
input_taz_shapefile_folder = 'input/taz-shapefile'

# se data
se_years = [2023,2032,2042,2050]
se_base_year = 2023
input_model_se_folder = 'input/se-data'
map_year = 2050

df_emp_subcategories = pd.read_csv('E:/GitHub/Resources/1-TDM/SeEmpSubtotalCategories.csv')

# HH+Emp intensity
hh_factor = 1.8

# Projects
# WHEN NO PROJECTS ARE DEFINED, CODE WILL ALL PROJECTS
df_projects = pd.DataFrame([
#    [1,'West Weber Rail'                , 'WestWeber'    ],
#    [2,'3300/3500 South'                , 'BRT3533S_Core'],
#    [3,'Roy to Clearfield via 3500 West', 'ClearRoyWest' ]
], columns=['project_id','project_name','tdm_line_name'])

df_projects['tdm_model'] = tdm_model  # add field for joining later


# NO BUILD OVERRIDES

taz_olympiahills_lst = [932,933,2030]
taz_pointofmountain_lst = [2138,2139,2140,2141,2149,2170]

taz_override_lst = taz_olympiahills_lst + taz_pointofmountain_lst
taz_override_lst

def get_condition_no_build(df, tazfieldname):
    return ((df['no_build'] == 1) & ~(df[tazfieldname].isin(taz_override_lst)));

# Define condition that parcels will not change
def get_condition_no_change(df):
                          # 1 : No Build
                          # 2a: Don't change parcels with single-family that do not allow any other uses
                          # 2b: Don't change parcels with single-family/multi-family that do not allow any other uses (neighborhoods in Clearfield/Layton)
    condition_no_change = (df['no_build'] == 0) & \
                          (((df['sf'] == 1) & \
                            (df[['mf', 'ind', 'retail', 'office', 'govt', 'mixed', 'other']].sum(axis=1) == 0)) | \
                           ((df[['sf', 'mf']].sum(axis=1) == 2) & \
                            (df[['ind', 'retail', 'office', 'govt', 'mixed', 'other']].sum(axis=1) == 0)))
    return condition_no_change


# Transposed dataframe definition
df_centers = pd.DataFrame(data={
    'Neighborhood Center': {
        'final_units_per_acre': 4,
        'final_emps_per_acre': 7,
        'household_size': 1.62,
        'office_retail_ind_split': '35/65/0'
    },
    'City Center': {
        'final_units_per_acre': 8,
        'final_emps_per_acre': 10,
        'household_size': 1.62,
        'office_retail_ind_split': '65/35/0'
    },
    'Urban Center': {
        'final_units_per_acre': 10,
        'final_emps_per_acre': 30,
        'household_size': 1.62,
        'office_retail_ind_split': '75/15/10'
    },
    'Metropolitan Center': {
        'final_units_per_acre': 11,
        'final_emps_per_acre': 60,
        'household_size': 1.62,
        'office_retail_ind_split': '80/10/10'
    }
}).T.reset_index().rename(columns={'index': 'center_type'})



# USE COUNTY MULTIPLIER
use_county_multiplier = True


# Define custom settings per county
df_centers_county_multipliers = pd.DataFrame([
    [57, 'Neighborhood Center','TOTEMP', 0.80],
    [57, 'City Center'        ,'TOTEMP', 0.80],
    [57, 'Urban Center'       ,'TOTEMP', 0.80],
    [57, 'Metropolitan Center','TOTEMP', 0.80],
    [35, 'Neighborhood Center','TOTHH' , 1.10],
    [35, 'Neighborhood Center','TOTEMP', 1.20],
    [35, 'City Center'        ,'TOTHH' , 1.25],
    [35, 'City Center'        ,'TOTEMP', 1.35],
    [35, 'Urban Center'       ,'TOTHH' , 1.35],
    [35, 'Urban Center'       ,'TOTEMP', 1.65],
    [35, 'Metropolitan Center','TOTHH' , 1.50],
    [35, 'Metropolitan Center','TOTEMP', 2.00],
    [49, 'Neighborhood Center','TOTHH' , 1.10],
    [49, 'Neighborhood Center','TOTEMP', 1.10],
    [49, 'City Center'        ,'TOTHH' , 1.25],
    [49, 'City Center'        ,'TOTEMP', 1.25],
    [49, 'Urban Center'       ,'TOTHH' , 1.35],
    [49, 'Urban Center'       ,'TOTEMP', 1.50],
    [49, 'Metropolitan Center','TOTHH' , 1.50],
    [49, 'Metropolitan Center','TOTEMP', 1.65]
], columns=['CO_FIPS','center_type','parameter','multiplier'])



def lookup_county(CoFip):
    county_map = {
        3: "Box Elder",
        11: "Davis",
        35: "Salt Lake",
        49: "Utah",
        57: "Weber"
    }
    return county_map.get(CoFip, "Unknown County")  # Default to "Unknown County" if CoFip is not found

def lookup_parameter_label(parameter):
    parameter_map = {
        "TOTHH" : "Households",
        "TOTEMP": "Employees"
    }
    return parameter_map.get(parameter, "Unknown Parameter")  # Default to "Unknown County" if CoFip is not found


