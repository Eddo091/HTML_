Vue.component('v-select-materias', VueSelect.VueSelect);

Vue.component('component-alumnos',{
    data:()=>{
        return{
          accion : 'nuevo',
          msg    : '',
          status : false,
          error  : false,
          buscar : "",
          alumno:{
              idAlumno  : 0,
              materia:{ 
                  id:0,
                  label:''

            },
              codigo    : '',
              nombre    : '',
              dirección : '',
              municipio : '',
              departamento : '',
              telefono  : '',
              fechaNacimiento      : '',
              sexo      : ''
        }, 
        alumno:[],
        materia:[]

    }
        
},
     methods:{
         buscandoAlumnos(){
             this.alumno = this.alumno.filter((element,index,alumno) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
             if( this.buscar.length<=0){
                 this.obtenerAlumnos();
             }
         },
         buscandoCodigoAlumnos(store){
            let buscarCodigo = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.alumno.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarAlumno(){
             /**
              * webSQL -> DB Relacional en el navegador
              * localStorage -> BD NOSQL clave/valor
              * indexedDB -> BD NOSQL clave/valor
              */
             let store = this.abrirStore("tblalumnos",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.alumno.idAlumno = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoAlumnos(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.alumno);
                query.onsuccess=event=>{
                    this.obtenerAlumnos();
                    this.limpiar();
                    
                    this.mostrarMsg(' Alumno guardado con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el Estudiante',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo de Alumno duplicado',true);
            }
        },
        mostrarMsg(msg, error){
            this.status = true;
            this.msg = msg;
            this.error = error;
            this.quitarMsg(3);
        },
        quitarMsg(time){
            setTimeout(()=>{
                this.status=false;
                this.msg = '';
                this.error = false;
            }, time*1000);
        },
        obtenerAlumnos(){
            let store = this.abrirStore('tblalumnos','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.alumno = data.result;
            };
            let storeMateria = this.abrirStore('tblmaterias','readonly'),
            dataMateria= storeMateria.getAll();
        this.materia = [];
        dataMateria.onsuccess=resp=>{
            dataMateria.result.forEach(element => {
                this.materia.push({id:element.idMateria, label:element.materia});
            });

        };
        },
        mostrarAlumnos(alum){
            this.alumno = alum;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.alumno.materia.id=0;
            this.alumno.materia.label="";
            this.alumno.idAlumno='';
            this.alumno.codigo='';
            this.alumno.nombre='';
            this.alumno.dirección='';
            this.alumno.municipio='';
            this.alumno.departamento='';
            this.alumno.telefono='';
            this.alumno.fechaNacimiento='';
            this.alumno.sexo='';
            this.obtenerAlumnos();
        },
        eliminarAlumnos(alum){
            if( confirm(`Esta seguro que desea eliminar el Alumno:  ${alum.nombre}`) ){
                let store = this.abrirStore("tblalumnos",'readwrite'),
                    req = store.delete(alum.idAlumno);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Alumno eliminado con exito',true);
                    this.obtenerAlumnos();
                };
                req.onerror=resp=>{
                    this.mostrarMsg('Error al eliminar el Alumno',true);
                    console.log( resp );
                };
            }
        },
        abrirStore(store,modo){
            let tx = db_alumnos.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        //this.obtenerAlumnos();
    },
     template: `  
     
     <form v-on:submit.prevent=" guardarAlumno" v-on:reset="limpiar" >
     <div class="row">
         <div class="col-sm-5">
             <div class="row p-2">
                 <div class="col-sm text-center text-white bg-primary">
                     <h5>REGISTRO DE ALUMNO</h5>
                 </div>
                 <div class="col-1 align-middle" >
                 <button type="button" onclick="appVue.forms['alumno'].mostrar=false" class="btn-close" aria-label="Close"></button>
             </div>

        </div>
        <div class="input-group-prepend card bg-light">
        <div class="row p-2">
                 <div class="col-sm">MATERIA:</div>
                 <div class="col-sm">
                        <v-select-materias v-model="alumno.materia" :options="materias" placeholder="Por favor seleccione la materia"/>
                        </div>
                    </div>
             <div class="row p-2">
                 <div class="col-sm">CODIGO:</div>
                 <div class="col-sm">
                     <input v-model="alumno.codigo"  required pattern="[A-Z Ñña-z]{3}[0-9]{6}" class="form-control form-control-sm"  placeholder="Ejem: ABC123456">

                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">NOMBRE: </div>
                 <div class="col-sm">
                     <input v-model="alumno.nombre" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm"  placeholder="Ejem: Nombre Apellido">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">DIRRECIÓN: </div>
                 <div class="col-sm">
                     <input v-model="alumno.dirrección" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm"  placeholder="Ejem: Casa">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">MUNICIPIO: </div>
                 <div class="col-sm">
                     <input v-model="alumno.Municipio" required pattern="[A-ZÑña-z0-9, ]{5,15}" type="text" class="form-control form-control-sm"  placeholder="Ejem: Usulután">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">DEPARTAMENTO: </div>
                 <div class="col-sm">
                     <input v-model="alumno.Departamento" required pattern="[A-ZÑña-z0-9, ]{5,15}" type="text" class="form-control form-control-sm" placeholder="Ejem: Usulután">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">TELEFONO: </div>
                 <div class="col-sm">
                     <input v-model="alumno.telefono" required pattern="[0-9]{4}-[0-9]{4}"  type="text" class="form-control form-control-sm"  placeholder="Ejem: 1234-5678">
                 </div>

             <div class="row p-2">
                     <div div class="col-sm">FECHA DE NACIMIENTO:</div>
                     <div class="col-sm">
                         <input v-model="alumno.fechaNacimiento" required pattern="{0000-00-00}"  type="date" class="form-control form-control-sm">
                 </div>
             </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">SEXO: </div>
                 <div class="col-sm">
                     <input v-model="alumno.sexo" required pattern= "[F/M f/m]{1}" type="text" type="text" class="form-control form-control-sm" placeholder="M/F">
                 </div>
             </div>
            </div>
<!----------BOTONES GUARDAR,LIMPIAR,MODIFICAR, ELIMINAR------->
             <div class="row p-2">
                 <div class="col-sm text-center">
                     <input type="submit" value="Guardar" class="btn btn-dark">
                     <input type="reset" value="Limpiar" class="btn btn-warning">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm text-center">
                     <div v-if="status" class="alert" v-bind:class="[error ? 'alert-danger' : 'alert-success']">
                         {{ msg }}
                     </div>
                 </div>
             </div>
         </div>


         <!----------ALUMNOS REGISTRADOS------->
         <div class="col-sm"></div>
         <div class="col-sm-6 p-2">
             <div class="row text-center text-white bg-primary">
                 <div class="col"><h5>ALUMNOS REGISTRADOS</h5></div>
             </div>
             <div class="row">
                 <div class="col">
                     <table class="table table-sm table-hover">
                         <thead>
                             <tr>
                                 <!----------BUSCAR------->
                                 <td colspan="5">
                                     <input v-model="buscar" v-on:keyup="buscandoAlumnos" type="text" class="form-control form-control-sm" placeholder="Buscar Alumnos"> 
                                     
                                 </td>
                             </tr>
                             <!----------TABLA------->
                             <tr>
                                 <th>CODIGO</th>
                                 <th>NOMBRE</th>
                                 <th>DIRRECIÓN</th>
                                 <th>MUNICIPIO</th>
                                 <th>DEPARTAMENTO</th>
                                 <th>TELEFONO</th>
                                 <th>FECHA</th>
                                 <th>SEXO</th>
                                 <th>MATERIA</th>
                                 <th></th>
                             </tr>
                         </thead>
                         <tbody>
                             <!----------ACCION DE LA TABLA------->
                             <tr v-for="alum in alumno" v-on:click="mostrarAlumnos(alum)">
                                 <td>{{alum.codigo }}</td>
                                 <td>{{alum.nombre }}</td>
                                 <td>{{alum.dirección }}</td>
                                 <td>{{alum.municipio }}</td>
                                 <td>{{alum.departamento }}</td>
                                 <td>{{alum.telefono }}</td>
                                 <td>{{alum.fechaNacimiento}}</td>
                                 <td>{{alum.sexo}}</td>
                                 <td>{{alum.materia.label}}</td>

                                 <td>
                                     <!----------BOTONES TABLA------->
                                     <a @click.stop="eliminarAlumnos(alum.idAlumno)" class="btn btn-danger">DEL</a>
                                 </td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </div>
         </div>
     </div>
 </form>
    
 `


});
    
