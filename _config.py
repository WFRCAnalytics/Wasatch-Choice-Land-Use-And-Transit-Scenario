import pandas as pd
import geopandas as gpd
import numpy as np

# variables

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

# Projects

df_projects = pd.DataFrame([
    [1,'West Weber Rail'                , 'WestWeber'    ],
    [2,'3300/3500 South'                , 'BRT3533S_Core'],
    [3,'Roy to Clearfield via 3500 West', 'ClearRoyWest' ]
], columns=['project_id','project_name','tdm_line_name'])

df_projects['tdm_model'] = tdm_model  # add field for joining later


df_centers = pd.DataFrame(data = {
    'Parameter':           ['FAR', 'bldg_size', 'size_of_hh_units', 'sf_per_employee', 'units_per_acre', 'sf_per_acre', '%_residential', '%_non_res', 'gross_to_net_conversion_(streets,_etc)', 'final_units_per_acre', 'final_emps_per_acre', 'application_area', 'application_area_miles'],
    'Neighborhood Center': [0.6  , 26136      , 1000              , 500              , 26.136          , 52.27        , 0.85           , 0.15       , 0.8                                     , 18                    , 6                    , '1/8 mile radius' , 0.1250                  ],
    'City Center':         [1.13 , 49222.8    , 850               , 450              , 57.90917647     , 109.38       , 0.85           , 0.15       , 0.8                                     , 39                    , 13                   , '990 foot radius' , 0.1875                  ],
    'Urban Center':        [1.5  , 65340      , 750               , 400              , 87.12           , 163.35       , 0.85           , 0.15       , 0.8                                     , 59                    , 20                   , '1/4 mile radius' , 0.2500                  ],
    'Metropolitan Center': [2.0  , 86734      , 650               , 350              , 133.43          , 247.81       , 0.85           , 0.15       , 0.8                                     , 91                    , 30                   , '1/3 mile radius' , 0.3333                  ]
})
df_centers.set_index('Parameter', inplace=True)
df_centers = df_centers.T.reset_index()
df_centers.rename(columns={'index':'center_type'}, inplace=True)

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