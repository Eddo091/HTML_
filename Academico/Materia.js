Vue.component('component-materias',{
    data:()=>{
        return {
            
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            materia:{
                accion : 'nuevo',
                idMateria  : 0,
                materia      : '',
                codigo      : '',
                docente : ''
            },
            materias:[]
        }
    },
    methods:{
        buscandoMateria(){
            this.materias = this.materias.filter((element,index,materias) => element.docente.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerMaterias();
            }
        },
        buscandoCodigoMateria(store){
            let buscarMateria = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.materia.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarMateria;
        },
        async guardarMateria(){
            /**
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
            let store = this.abrirStore("tblmaterias",'readwrite'),
                duplicado = false;
            if( this.Materia.accion=='nuevo' ){
                this.materia.idMateria = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoMateria(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false && this.materia.codigo.trim()!=""){
                fetch(`private/modulos/materias/administracion.php?materia=${JSON.stringify(this.materia)}`,
                    {credentials: 'same-origin'})
                    .then(resp=>resp.json())
                    .then(resp=>{
                        this.obtenerDatos();
                        this.limpiar();

                        this.mostrarMsg('Registro se guardo con exito',false);
                    });
            } else{
                this.mostrarMsg('Codigo de materia duplicado, o vacio',true);
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
        obtenerMaterias(){
            let store = this.abrirStore('tblmaterias','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.materias = data.result;
            };
        },
        mostrarMateria(alum){
            this.materia = alum;
            this.materia.accion='modificar';
        },
        limpiar(){
            this.materia.accion='nuevo';
            this.materia.idMateria='';
            this.materia.materia='';
            this.materia.codigo='';
            this.materia.docente='';
            this.obtenerMaterias();
        },
        eliminarMateria(alum){
            if( confirm(`Esta seguro que desea eliminar el materia:  ${alum.docente}`) ){
                this.materia = alum;
                this.materia.accion = "eliminar";
                fetch(`private/modulos/materias/administracion.php?materia=${JSON.stringify(this.materia)}`,
                    {credentials: 'same-origin'})
                    .then(resp=>resp.json())
                    .then(resp=>{
                        this.obtenerDatos();
                        this.limpiar();

                        this.mostrarMsg('Registro se eliminno con exito',true);
                    });
                }
        },
        abrirStore(store,modo){
            let tx = db.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        //this.obtenerMaterias();
    },
    template:`
        <form v-on:submit.prevent="guardarMateria" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE MATERIAS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['materia'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="input-group-prepend card bg-light">
                    <div class="row p-2">
                        <div class="col-sm">MATERIA:</div>
                        <div class="col-sm">
                            <input v-model="materia.materia" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">CODIGO:</div>
                        <div class="col-sm">
                            <input v-model="materia.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">DOCENTE: </div>
                        <div class="col-sm">
                            <input v-model="materia.docente" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    </div>
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
                <div class="col-sm"></div>
                <div class="col-sm-6 p-2">
                    <div class="row text-center text-white bg-primary">
                        <div class="col"><h5>MATERIAS REGISTRADAS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoMateria" type="text" class="form-control form-contro-sm" placeholder="Buscar materias">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>MATERIA</th>
                                        <th>CODIGO</th>
                                        <th>DOCENTE</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="alum in materias" v-on:click="mostrarMateria(alum)">
                                        <td>{{ alum.materia }}</td>
                                        <td>{{ alum.codigo }}</td>
                                        <td>{{ alum.docente }}</td>
                                        <td>
                                            <a @click.stop="eliminarMateria(alum)" class="btn btn-danger">DEL</a>
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