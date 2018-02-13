from django.http import HttpResponse
from django.template.loader import get_template

from django.shortcuts import render, redirect
from django.views.generic.edit import FormView
import subprocess
import logging

from .forms import FormUpload


class dataacquisition(FormView):

    template_name = "dataAcquisition/dataacquisition.html"
    success_url = '/dataacquisition.html'

    def get(self, request, *args, **kwargs):
        data = {'form': self.form_class}
        plants = ['Ras Abu Fontas Kahrama', 'Torrevieja', 'Ras Abu Fontas Kahrama', 'Torrevieja', 'Ras Abu Fontas Kahrama', 'Torrevieja',  'Ras Abu Fontas Kahrama', 'Torrevieja',  'Ras Abu Fontas Kahrama', 'Torrevieja']
        context = {'plants': plants}
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):

        if request.method == 'POST':
            if 'csv' in request.FILES:
                form = FormUpload(request.POST, request.FILES)
                csv = request.FILES['csv']
                form.handle_uploaded_file(csv)
                t = get_template('dataacquisition.html')
                plants = ['Ras Abu Fontas Kahrama', 'Torrevieja', 'Ras Abu Fontas Kahrama', 'Torrevieja',
                        'Ras Abu Fontas Kahrama', 'Torrevieja', 'Ras Abu Fontas Kahrama', 'Torrevieja',
                        'Ras Abu Fontas Kahrama', 'Torrevieja']
                context = {'first_name': 'Last file upload: ' + csv.name,
                           'plants': plants}
                return render(request, self.template_name, context)
            elif request.POST.get('upload', 'false') == 'true':
                data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<dataAquisition>\n\t<userSentinel>elucas</userSentinel>\n\t<passwordSentinel>Despeche88.</passwordSentinel>\n"
                if request.POST.get('namePlant', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    namePlant = request.POST.get('namePlant', 'false').split()
                    namePlantFolder = namePlant.pop(0)
                    for i in namePlant:
                        namePlantFolder = namePlantFolder + "_" + i
                    data = data + "\t<namePlant>" + namePlantFolder + "</namePlant>\n"
                if request.POST.get('lengthx', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    data = data + "\t<lengthx>" + request.POST.get('lengthx', 'false') + "</lengthx>\n"
                if request.POST.get('lengthX', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    data = data + "\t<lengthX>" + request.POST.get('lengthX', 'false') + "</lengthX>\n"
                if request.POST.get('latitudey', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    data = data + "\t<latitudey>" + request.POST.get('latitudey', 'false') + "</latitudey>\n"
                if request.POST.get('latitudeY', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    data = data + "\t<latitudeY>" + request.POST.get('latitudeY', 'false') + "</latitudeY>\n"
                if request.POST.get('date', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    date = request.POST.get('date', 'false').split('/')
                    data = data + "\t<date>" + date[0] + date[1] + date[2] + "</date>\n"
                if request.POST.get('days', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    data = data + "\t<days>" + request.POST.get('days', 'false') + "</days>\n"
                if request.POST.get('email', '') == '':
                    return HttpResponse('/dataacquisition.html')
                else:
                    data = data + "\t<email>" + request.POST.get('email', 'false') + "</email>\n"
                data = data + "\t<modisAqua read=\"true\">\n\t\t<chlorophyll_concentration_oc3>"
                if request.POST.get('chlorophyll_concentration_oc3', False) == 'true':
                    data = data + "true</chlorophyll_concentration_oc3>\n"
                else:
                    data = data + "false</chlorophyll_concentration_oc3>\n"
                data = data + "\t\t<chlorophyll_concentration_oci>"
                if request.POST.get('chlorophyll_concentration_oci', False) == 'true':
                    data = data +"true</chlorophyll_concentration_oci>\n"
                else:
                    data = data + "false</chlorophyll_concentration_oci>\n"
                data = data + "\t\t<intantaneous_photosynthetically_avaliable_radiation>"
                if request.POST.get('intantaneous_photosynthetically_avaliable_radiation', False) == 'true':
                    data = data + "true</intantaneous_photosynthetically_avaliable_radiation>\n"
                else:
                    data = data + "false</intantaneous_photosynthetically_avaliable_radiation>\n"
                data = data + "\t\t<normalized_fliorescence_line_height>"
                if request.POST.get('normalized_fliorescence_line_height', False) == 'true':
                    data = data + "true</normalized_fliorescence_line_height>\n"
                else:
                    data = data + "false</normalized_fliorescence_line_height>\n"
                data = data + "\t\t<absorption_due_to_gelbstoff_and_detrital_material_443nm_gsm_algorithm>"
                if request.POST.get('absorption_due_to_gelbstoff_and_detrital_material_443nm_gsm_algorithm', False) == 'true':
                    data = data + "true</absorption_due_to_gelbstoff_and_detrital_material_443nm_gsm_algorithm>\n"
                else:
                    data = data + "false</absorption_due_to_gelbstoff_and_detrital_material_443nm_gsm_algorithm>\n"
                data = data + "\t\t<particulate_backscattering_443nm_gsm_algorithm>false</particulate_backscattering_443nm_gsm_algorithm>\n"
                data = data + "\t\t<chlorophyll_concentration_gsm_model>"
                if request.POST.get('chlorophyll_concentration_gsm_model', False) == 'true':
                    data = data + "true</chlorophyll_concentration_gsm_model>\n"
                else:
                    data = data + "false</chlorophyll_concentration_gsm_model>\n"
                data = data + "\t\t<detritial_and_gelbstoff_absorption_spectral_parameter_for_giop_model>"
                if request.POST.get('detritial_and_gelbstoff_absorption_spectral_parameter_for_giop_model', False) == 'true':
                    data = data + "true</detritial_and_gelbstoff_absorption_spectral_parameter_for_giop_model>\n"
                else:
                    data = data + "false</detritial_and_gelbstoff_absorption_spectral_parameter_for_giop_model>\n"
                data = data + "\t\t<uncertainty_in_absorption_due_to_gelbstoff_and_detrital_material_443nm_giop_model>false</uncertainty_in_absorption_due_to_gelbstoff_and_detrital_material_443nm_giop_model>\n"
                data = data + "\t\t<absorption_due_to_phytoplankton_443nm_giop_model>"
                if request.POST.get('absorption_due_to_phytoplankton_443nm_giop_model', False) == 'true':
                    data = data + "true</absorption_due_to_phytoplankton_443nm_giop_model>\n"
                else:
                    data = data + "false</absorption_due_to_phytoplankton_443nm_giop_model>\n"
                data = data + "\t\t<uncertainty_in_absorption_due_to_phytoplankton_443nm_giop_model>false</uncertainty_in_absorption_due_to_phytoplankton_443nm_giop_model>\n"
                data = data + "\t\t<total_absorption_412nm_giop_model>false</total_absorption_412nm_giop_model>\n"
                data = data + "\t\t<total_absorption_443nm_giop_model>false</total_absorption_443nm_giop_model>\n"
                data = data + "\t\t<total_absorption_469nm_giop_model>false</total_absorption_469nm_giop_model>\n"
                data = data + "\t\t<total_absorption_488nm_giop_model>false</total_absorption_488nm_giop_model>\n"
                data = data + "\t\t<total_absorption_531nm_giop_model>false</total_absorption_531nm_giop_model>\n"
                data = data + "\t\t<total_absorption_547nm_giop_model>false</total_absorption_547nm_giop_model>\n"
                data = data + "\t\t<total_absorption_555nm_giop_model>false</total_absorption_555nm_giop_model>\n"
                data = data + "\t\t<total_absorption_645nm_giop_model>false</total_absorption_645nm_giop_model>\n"
                data = data + "\t\t<total_absorption_667nm_giop_model>false</total_absorption_667nm_giop_model>\n"
                data = data + "\t\t<total_absorption_678nm_giop_model>false</total_absorption_678nm_giop_model>\n"
                data = data + "\t\t<particulate_backscattering_443nm_giop_model>false</particulate_backscattering_443nm_giop_model>\n"
                data = data + "\t\t<backscattering_spectral_parameter_for_giop_model>false</backscattering_spectral_parameter_for_giop_model>\n"
                data = data + "\t\t<uncertainty_in_particulate_backscatter_443nm_giop_model>false</uncertainty_in_particulate_backscatter_443nm_giop_model>\n"
                data = data + "\t\t<otal_backscattering_412nm_giop_model>false</otal_backscattering_412nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_443nm_giop_model>false</total_backscattering_443nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_469nm_giop_model>false</total_backscattering_469nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_488nm_giop_model>false</total_backscattering_488nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_531nm_giop_model>false</total_backscattering_531nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_547nm_giop_model>false</total_backscattering_547nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_555nm_giop_model>false</total_backscattering_555nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_645nm_giop_model>false</total_backscattering_645nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_667nm_giop_model>false</total_backscattering_667nm_giop_model>\n"
                data = data + "\t\t<total_backscattering_678nm_giop_model>false</total_backscattering_678nm_giop_model>\n"
                data = data + "\t\t<diffuse_attenuation_coefficient_490nm_kd2_algorithm>"
                if request.POST.get('diffuse_attenuation_coefficient_490nm_kd2_algorithm', False) == 'true':
                    data = data + "true</diffuse_attenuation_coefficient_490nm_kd2_algorithm>\n"
                else:
                    data = data + "false</diffuse_attenuation_coefficient_490nm_kd2_algorithm>\n"
                data = data + "\t\t<normalized_difference_vegetation_index>"
                if request.POST.get('normalized_difference_vegetation_index', False) == 'true':
                    data = data + "true</normalized_difference_vegetation_index>\n"
                else:
                    data = data + "false</normalized_difference_vegetation_index>\n"
                data = data + "\t\t<sea_surface_temperature>"
                if request.POST.get('sea_surface_temperature', False) == 'true':
                    data = data + "true</sea_surface_temperature>\n"
                else:
                    data = data + "false</sea_surface_temperature>\n"
                data = data + "\t\t<photosynthetically_available_radiation>"
                if request.POST.get('photosynthetically_available_radiation', False) == 'true':
                    data = data + "true</photosynthetically_available_radiation>\n"
                else:
                    data = data + "false</photosynthetically_available_radiation>\n"
                data = data + "\t\t<calcite_concentration>"
                if request.POST.get('calcite_concentration', False) == 'true':
                    data = data + "true</calcite_concentration>\n"
                else:
                    data = data + "false</calcite_concentration>\n"
                data = data + "\t\t<particle_organic_carbon>"
                if request.POST.get('particle_organic_carbon', False) == 'true':
                    data = data + "true</particle_organic_carbon>\n"
                else:
                    data = data + "false</particle_organic_carbon>\n"
                data = data + "\t\t<absorption_due_to_gelbstoff_and_detrital_material_443nm_qaa_algorithm>false</absorption_due_to_gelbstoff_and_detrital_material_443nm_qaa_algorithm>\n"
                data = data + "\t\t<absorption_due_to_phytoplankton_443nm_qaa_algorithm>false</absorption_due_to_phytoplankton_443nm_qaa_algorithm>\n"
                data = data + "\t\t<total_absorption_443nm_qaa_algorithm>false</total_absorption_443nm_qaa_algorithm>\n"
                data = data + "\t\t<particulate_backscattering_443nm_qaa_algorithm>false</particulate_backscattering_443nm_qaa_algorithm>\n"
                data = data + "\t\t<aerosol_angstrom_exponent>false</aerosol_angstrom_exponent>\n"
                data = data + "\t\t<aerosol_optical_thickness_869nm>false</aerosol_optical_thickness_869nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_412nm>false</remote_sensing_reflectance_412nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_443nm>false</remote_sensing_reflectance_443nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_469nm>false</remote_sensing_reflectance_469nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_488nm>false</remote_sensing_reflectance_488nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_531nm>false</remote_sensing_reflectance_531nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_547nm>false</remote_sensing_reflectance_547nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_555nm>false</remote_sensing_reflectance_555nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_645nm>false</remote_sensing_reflectance_645nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_667nm>false</remote_sensing_reflectance_667nm>\n"
                data = data + "\t\t<remote_sensing_reflectance_678nm>false</remote_sensing_reflectance_678nm>\n"
                data = data + "\t\t<four_um_sea_surface_temperature>"
                if request.POST.get('four_um_sea_surface_temperature', False) == 'true':
                    data = data + "true</four_um_sea_surface_temperature>\n"
                else:
                    data = data + "false</four_um_sea_surface_temperature>\n"
                data = data + "\t\t<euphotic_depth_Lee_algorithm>"
                if request.POST.get('euphotic_depth_Lee_algorithm', False) == 'true':
                    data = data + "true</euphotic_depth_Lee_algorithm>\n\t</modisAqua>\n"
                else:
                    data = data + "false</euphotic_depth_Lee_algorithm>\n\t</modisAqua>\n"

                if request.POST.get('sea_ice_eastward_velocity',False) == 'true' or request.POST.get('salinity',False) == 'true' or request.POST.get('sea_ice_thickness',False) == 'true' or request.POST.get('temperature',False) == 'true' or request.POST.get('ice_concentration',False) == 'true' or request.POST.get('eastward_velocity',False) == 'true' or request.POST.get('northward_velocity',False) == 'true' or request.POST.get('density_ocean_mixed_layer_thickness',False) == 'true' or request.POST.get('sea_surface_height',False) == 'true' or request.POST.get('sea_ice_northward_velocity',False) == 'true' or request.POST.get('sea_floor_potential_temperature',False) == 'true' or request.POST.get('mole_concentration_of_dissolved_iron',False) == 'true' or request.POST.get('net_primary_productivity_of_carbon',False) == 'true' or request.POST.get('mole_concentration_of_silicate',False) == 'true' or request.POST.get('mole_concentration_of_nitrate',False) == 'true' or request.POST.get('mass_concentration_of_chlorophyll',False) == 'true' or request.POST.get('mole_concentration_of_phytoplankton_expressed_as_carbon',False) == 'true' or request.POST.get('mole_concentration_of_phosphate',False) == 'true' or request.POST.get('mole_concentration_of_dissolved_oxygen',False) == 'true':
                    data = data + "\t<sentinel read=\"true\">\n\t\t<physical>true</physical>\n"
                else:
                    data = data + "\t<sentinel read=\"true\">\n\t\t<physical>false</physical>\n"
                if request.POST.get('chlorophyll',False) == 'true':
                    data = data + "\t\t<chlorophyll>true</chlorophyll>\n\t</sentinel>\n"
                else:
                    data = data + "\t\t<chlorophyll>false</chlorophyll>\n\t</sentinel>\n"
                data = data + "\t<cfsr read=\"false\">\n\t</cfsr>\n\t<ecmwf read=\"false\">\n\t\t<relative_humidity>false</relative_humidity>\n\t\t<specific_humidity>false</specific_humidity>\n\t\t<temperature>false</temperature>\n\t\t<two_metre_dewpoint_temperature>false</two_metre_dewpoint_temperature>\n\t\t<dust_aerosol_optical_depth_at_550nm>false</dust_aerosol_optical_depth_at_550nm>\n\t\t<total_aerosol_optical_depth_at_550nm>false</total_aerosol_optical_depth_at_550nm>\n\t\t<Total_aerosol_optical_depth_at_1240nm>false</Total_aerosol_optical_depth_at_1240nm>\n\t\t<two_metre_temperature>false</two_metre_temperature>\n\t\t<particulate_matter_d_less_1_um>false</particulate_matter_d_less_1_um>\n\t\t<ten_metre_U_wind_component>false</ten_metre_U_wind_component>\n\t\t<uv_biologically_effective_dose_clear-sky>false</uv_biologically_effective_dose_clear-sky>\n\t\t<particulate_matter_d_less_2.5_um>false</particulate_matter_d_less_2.5_um>\n\t</ecmwf >\n</dataAquisition>"

                logger = logging.getLogger(__name__)
                f = open('media/variables.xml', 'w')
                f.write(data)
                f.close()
                r = subprocess.call(['echo \"hola\" | mail -s \"hola\" choco@usal.es'], shell=True)
                return self.form_valid(form, **kwargs)
            elif request.POST.get('plants', 'false') != 'false':

                return redirect()

        else:
            return HttpResponse('/dataacquisition.html')

