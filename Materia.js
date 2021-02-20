Vue.component('component-materias',{
    data:()=>{
        return {
            accion : 'nuevo',
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            materia:{
                idMateria  : 0,
                materia      : '',
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
            if( this.accion=='nuevo' ){
                this.materia.idMateria = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoMateria(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.materia);
                query.onsuccess=event=>{
                    this.obtenerMaterias();
                    this.limpiar();
                    
                    this.mostrarMsg('Registro se guardo con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el registro',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo de materia duplicado',true);
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
        mostrarMateria(ma){
            this.materia = ma;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.materia.idMateria='';
            this.materia.codigo='';
            this.materia.docente='';
            this.obtenerMaterias();
        },
        eliminarMateria(ma){
            if( confirm(`Esta seguro que desea eliminar el materia:  ${ma.docente}`) ){
                let store = this.abrirStore("tblmaterias",'readwrite'),
                    req = store.delete(ma.idMateria);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Registro eliminado con exito',true);
                    this.obtenerMaterias();
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
                    <div class="row p-2">
                        <div class="col-sm">MATERIA:</div>
                        <div class="col-sm">
                            <input v-model="materia.materia" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">DOCENTE: </div>
                        <div class="col-sm">
                            <input v-model="materia.docente" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
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
                                        <th>CODIGO</th>
                                        <th>DESCRIPCION</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="ma in materias" v-on:click="mostrarMateria(ma)">
                                        <td>{{ ma.codigo }}</td>
                                        <td>{{ ma.docente }}</td>
                                        <td>
                                            <a @click.stop="eliminarMateria(ma)" class="btn btn-danger">DEL</a>
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