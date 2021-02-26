Vue.component('v-select-materias', VueSelect.VueSelect);
Vue.component('v-select-alumnos', VueSelect.VueSelect);

Vue.component('component-inscripcion',{
    data:()=>{
        return {
            accion : 'nuevo',
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            inscripcion:{
                idInscrito : 0,
                codigo    : '',
                fechainscripcion : ''
            },
            inscripcion:[],
            materias:[],
            alumno:[]
        }
    },
    methods:{
        buscandoInscripcion(){
            this.inscripcion = this.inscripcions.filter((element,index,inscripcion) => element.alumno.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerDatos();
            }
        },
        buscandoCodigoInscripcion(store){
            let buscarCodigo = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.inscripcion.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarInscripcion(){
            /**
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
            let store = this.abrirStore("tblinscripcion",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.inscripcion.idInscrito = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoInscripcion(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.inscripcion);
                query.onsuccess=event=>{
                    this.obtenerDatos();
                    this.limpiar();
                    
                    this.mostrarMsg('Registro se guardo con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el registro',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo de inscripcion duplicado',true);
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
        obtenerDatos(){
            let store = this.abrirStore('tblinscripcion','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.inscripcion = data.result;
            };
            let storeMateria = this.abrirStore('tblmaterias','readonly'),
            dataMateria= storeMateria.getAll();
        this.materia = [];
        dataMateria.onsuccess=resp=>{
            dataMateria.result.forEach(element => {
                this.materia.push({id:element.idMateria, label:element.materia});
            });

        };
        let storeAlumno = this.abrirStore('tblalumnos','readonly'),
            dataAlumno= storeAlumno.getAll();
        this.alumno = [];
        dataAlumno.onsuccess=resp=>{
            dataAlumno.result.forEach(element => {
                this.alumno.push({id:element.idAlumno, label:element.alumno});
            });

        };
        },
        mostrarInscripcion(alum){
            this.inscripcion = alum;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';

            this.inscripcion.materia.id=0;
            this.inscripcion.materia.label="";
            this.inscripcion.alumno.id=0;
            this.inscripcion.alumno.label="";

            this.inscripcion.idInscrito='';
            this.inscripcion.codigo='';
            this.inscripcion.fechainscripcion='';
            this.obtenerDatos();
        },
        eliminarInscripcion(alum){
            if( confirm(`Esta seguro que desea eliminar el inscripcion:  ${alum.codigo}`) ){
                let store = this.abrirStore("tblinscripcion",'readwrite'),
                    req = store.delete(alum.idInscrito);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Registro eliminado con exito',true);
                    this.obtenerDatos();
                };
                req.onerror=resp=>{
                    this.mostrarMsg('Error al eliminar el registro',true);
                    console.log( resp );
                };
            }
        },
        abrirStore(store,modo){
            let tx = db.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        //this.obtenerDatos();
    },
    template:`
        <form v-on:submit.prevent="guardarInscripcion" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE INSCRIPCIONES</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['inscripcion'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="input-group-prepend card bg-light">
                    <div class="row p-2">
                        <div class="col-sm">CODIGO DE INSCRIPCION:</div>
                        <div class="col-sm">
                            <input v-model="inscripcion.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="col-sm">ALUMNO:</div>
                    <div class="col-sm">
                           <v-select-alumnos v-model="inscripcion.alumno" :options="alumno" placeholder="Por favor seleccione el alumno"/>
                           </div>
                    <div class="row p-2">
                    <div class="row p-2">
                    <div div class="col-sm">FECHA DE INSCRIPCION:</div>
                    <div class="col-sm">
                        <input v-model="alumno.fechainscripcion" required pattern="{0000-00-00}"  type="date" class="form-control form-control-sm">
                </div>
            </div>

               
                    
                    <div class="col-sm">MATERIA:</div>
                 <div class="col-xs">
                        <v-select-materias v-model="inscripcion.materia" :options="materias" placeholder="Por favor seleccione la materia"/>
                        </div>
                    
                    
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">
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
                <div class="col-sm"></div>
                <div class="col-sm-6 p-2">
                    <div class="row text-center text-white bg-primary">
                        <div class="col"><h5> INSCRIPCIONES REGISTRADOS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoInscripcion" type="text" class="form-control form-contro-sm" placeholder="Buscar inscripcion">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>CODIGO</th>
                                        <th>ALUMNO</th>
                                        <th>MATERIA</th>
                                        <th>FECHA INSCRIPCION</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="alum in inscripcion" v-on:click="mostrarInscripcion(alum)">
                                        <td>{{ alum.inscripcion.codigo }}</td>
                                        <td>{{ alum.nombre.label}}</td>
                                        <td>{{ alum.materia.label}}</td>
                                        <td>{{ alum.inscripcion.fechainscripcion}}</td>
                                        <td>
                                            <a @click.stop="eliminarInscripcion(alum)" class="btn btn-danger">DEL</a>
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