import pandas as pd
import geopandas as gpd
import numpy as np

# variables

df_center_override = pd.DataFrame([
    [15180,'Urban Center']
], columns=['N','nearest_AreaType'])

# location of tdm for model runs
tdm_path = r'E:\GitHub\WF-TDM-v9x'

# transit files
input_model_line_files_folder = 'input/transit-lin-files'
tdm_model = 'WF-TDM-v9x_application/v901-transit-corridors_6adb48'
tdm_transit_scenario = 'Lin_2032_3Corridors'

# network shapefile
tdm_link_shapefile = 'WFv902_MasterNet - Link.shp'
input_tdm_link_shapefile_folder = 'input/tdm-link-shapefile'
tdm_node_shapefile = 'WFv902_MasterNet - Node.shp'
input_tdm_node_shapefile_folder = 'input/tdm-node-shapefile'

# taz shapefile
taz_shapefile = 'WFv900_TAZ.shp'
input_taz_shapefile_folder = 'input/taz-shapefile'

# se data
se_years = [2023,2032,2042,2050]
se_base_year = 2023
input_model_se_folder = 'input/se-data'
map_year = 2050

df_emp_subcategories = pd.read_csv('E:/GitHub/Resources/TDM/SeEmpSubtotalCategories.csv')

# Projects

df_projects = pd.DataFrame([
    [1,'West Weber Rail'                , 'WestWeber'    ],
    [2,'3300/3500 South'                , 'BRT3533S_Core'],
    [3,'Roy to Clearfield via 3500 West', 'ClearRoyWest' ]
], columns=['project_id','project_name','tdm_line_name'])

df_projects['tdm_model'] = tdm_model  # add field for joining later

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
        'FAR': 0.6,
        'bldg_size': 26136,
        'size_of_hh_units': 1000,
        'sf_per_employee': 500,
        'units_per_acre': 26.136,
        'sf_per_acre': 52.27,
        '%_residential': 0.85,
        '%_non_res': 0.15,
        'gross_to_net_conversion_(streets,_etc)': 0.8,
        'final_units_per_acre': 18,
        'final_emps_per_acre': 6,
        'application_area': '1/8 mile radius',
        'application_area_miles': 0.1250,
        'household_size': 1.62,
        'office_retail_split': '20/80'
    },
    'City Center': {
        'FAR': 1.13,
        'bldg_size': 49222.8,
        'size_of_hh_units': 850,
        'sf_per_employee': 450,
        'units_per_acre': 57.90917647,
        'sf_per_acre': 109.38,
        '%_residential': 0.85,
        '%_non_res': 0.15,
        'gross_to_net_conversion_(streets,_etc)': 0.8,
        'final_units_per_acre': 39,
        'final_emps_per_acre': 13,
        'application_area': '990 foot radius',
        'application_area_miles': 0.1875,
        'household_size': 1.62,
        'office_retail_split': '30/70'
    },
    'Urban Center': {
        'FAR': 1.5,
        'bldg_size': 65340,
        'size_of_hh_units': 750,
        'sf_per_employee': 400,
        'units_per_acre': 87.12,
        'sf_per_acre': 163.35,
        '%_residential': 0.85,
        '%_non_res': 0.15,
        'gross_to_net_conversion_(streets,_etc)': 0.8,
        'final_units_per_acre': 59,
        'final_emps_per_acre': 20,
        'application_area': '1/4 mile radius',
        'application_area_miles': 0.2500,
        'household_size': 1.62,
        'office_retail_split': '40/60'
    },
    'Metropolitan Center': {
        'FAR': 2.0,
        'bldg_size': 86734,
        'size_of_hh_units': 650,
        'sf_per_employee': 350,
        'units_per_acre': 133.43,
        'sf_per_acre': 247.81,
        '%_residential': 0.85,
        '%_non_res': 0.15,
        'gross_to_net_conversion_(streets,_etc)': 0.8,
        'final_units_per_acre': 91,
        'final_emps_per_acre': 30,
        'application_area': '1/3 mile radius',
        'application_area_miles': 0.3333,
        'household_size': 1.62,
        'office_retail_split': '50/50'
    }
}).T.reset_index().rename(columns={'index': 'center_type'})