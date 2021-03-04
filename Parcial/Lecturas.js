Vue.component('v-select-clientes', VueSelect.VueSelect);

Vue.component('component-lecturas',{
    data:()=>{
        return {
            accion : 'nuevo',
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            lecturas:{
                idLectura  : 0,
                lectura:{ 
                    id:0,
                    label:''
  
              },
                accion : 'nuevo',
                lectura      : '',
                fecha      : '',
                lanterior : '',
                lactual : '',
                pago : ''
            },
            lecturas:[],
            Clientes:[]
        }
    },
    methods:{
        buscandoLectura(){
            this.lecturas = this.lecturas.filter((element,index,lecturas) => element.docente.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerLecturas();
            }
        },
        buscandoCodigoLectura(store){
            let buscarMateria = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.lectura.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarMateria;
        },
        async guardarLectura(){
            /**
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
            let store = this.abrirStore("tbllecturas",'readwrite'),
                duplicado = false;
            if( this.Materia.accion=='nuevo' ){
                this.lectura.idLectura = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoLectura(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false && this.lectura.codigo.trim()!=""){
                fetch(`private/modulos/lecturas/administracionparcial.php?lectura=${JSON.stringify(this.lectura)}`,
                    {credentials: 'same-origin'})
                    .then(resp=>resp.json())
                    .then(resp=>{
                        this.obtenerDatos();
                        this.limpiar();

                        this.mostrarMsg('Registro se guardo con exito',false);
                    });
            } else{
                this.mostrarMsg('Codigo de lectura duplicado, o vacio',true);
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
        obtenerLecturas(){
            let store = this.abrirStore('tbllecturas','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.lecturas = data.result;
            };
            let storeClientes = this.abrirStore('tblclientes','readonly'),
            dataLectura= storeClientes.getAll();
        this.cliente = [];
        dataLectura.onsuccess=resp=>{
            dataLectura.result.forEach(element => {
                this.cliente.push({id:element.idCliente, label:element.cliente});
            });

        };
        },
        mostrarMateria(cliente){
            this.lectura = cliente;
            this.lectura.accion='modificar';
        },
        limpiar(){
            this.lectura.accion='nuevo';
            this.lectura.cliente.id=0;
            this.lectura.cliente.label="";
            this.lectura.idLectura='';
            this.lectura.lectura='';
            this.lectura.fecha='';
            this.lectura.lanterior='';
            this.lectura.lactual='';
            this.lectura.pago='';
            this.obtenerLecturas();
        },
        eliminarLectura(lectura){
            if( confirm(`Esta seguro que desea eliminar el lectura:  ${lectura.lanterior}`) ){
                this.lectura = lectura;
                this.lectura.accion = "eliminar";
                fetch(`private/modulos/lecturas/administracion.php?lectura=${JSON.stringify(this.lectura)}`,
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
        //this.obtenerLecturas();
    },
    template:`
        <form v-on:submit.prevent="guardarLectura" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE LECTURAS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['lectura'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="input-group-prepend card bg-light">
                    <div class="row p-2">

                    <div class="col-sm">Cliente:</div>
                    <div class="col-sm">
                           <v-select-clientes v-model="lectura.cliente" :options="clientes" placeholder="Por favor seleccione el cliente"/>
                           </div>
                       </div>
                <div class="row p-2">
                        <div class="col-sm">FECHA:</div>
                        <div class="col-sm">
                            <input v-model="lectura.fecha"  required pattern="{0000-00-00}"  type="date" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">LECTURA ANTERIOR</div>
                        <div class="col-sm">
                            <input v-model="lectura.lanterior" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">LECTURA ACTUAL: </div>
                        <div class="col-sm">
                            <input v-model="lectura.lactual" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">PAGO: </div>
                        <div class="col-sm">
                            <input v-model="lectura.pago" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
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
                        <div class="col"><h5>LECTURAS REGISTRADAS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoLectura" type="text" class="form-control form-contro-sm" placeholder="Buscar lecturas">
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
                                    <tr v-for="cliente in lecturas" v-on:click="mostrarMateria(cliente)">
                                        <td>{{ cliente.lectura }}</td>
                                        <td>{{ cliente.codigo }}</td>
                                        <td>{{ cliente.docente }}</td>
                                        <td>{{cliente.lectura.label}}</td>
                                        <td>
                                            <a @click.stop="eliminarLectura(cliente)" class="btn btn-danger">DEL</a>
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