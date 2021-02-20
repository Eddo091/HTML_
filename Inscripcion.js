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
                nombre    : '',
                direccion : '',
                telefono  : '',
            },
            inscripcions:[]
        }
    },
    methods:{
        buscandoInscripcion(){
            this.inscripcions = this.inscripcions.filter((element,index,inscripcions) => element.nombre.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
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
        async guardarCliente(){
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
        },
        mostrarInscripcion(ins){
            this.inscripcion = ins;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.inscripcion.idInscrito='';
            this.inscripcion.codigo='';
            this.inscripcion.nombre='';
            this.inscripcion.direccion='';
            this.inscripcion.telefono='';
            this.obtenerDatos();
        },
        eliminarInscripcion(ins){
            if( confirm(`Esta seguro que desea eliminar el inscripcion:  ${ins.descripcion}`) ){
                let store = this.abrirStore("tblinscripcion",'readwrite'),
                    req = store.delete(ins.idInscrito);
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
        <form v-on:submit.prevent="guardarCliente" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE CLIENTES</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['inscripcion'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">CODIGO:</div>
                        <div class="col-sm">
                            <input v-model="inscripcion.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">NOMBRE: </div>
                        <div class="col-sm">
                            <input v-model="inscripcion.nombre" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">DIRECCION: </div>
                        <div class="col-sm">
                            <input v-model="inscripcion.direccion" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">TEL: </div>
                        <div class="col-sm">
                            <input v-model="inscripcion.telefono" required pattern="[0-9]{4}-[0-9]{4}" type="text" class="form-control form-control-sm">
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
                        <div class="col"><h5>CLIENTES REGISTRADOS</h5></div>
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
                                        <th>NOMBRE</th>
                                        <th>DIRECCION</th>
                                        <th>TEL</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="ins in inscripcion" v-on:click="mostrarInscripcion(ins)">
                                        <td>{{ ins.codigo }}</td>
                                        <td>{{ ins.nombre }}</td>
                                        <td>{{ ins.direccion }}</td>
                                        <td>{{ ins.telefono }}</td>
                                        <td>
                                            <a @click.stop="eliminarInscripcion(ins)" class="btn btn-danger">DEL</a>
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