Vue.component('component-Clientes',{
    data:()=>{
        return{
          msg    : '',
          status : false,
          error  : false,
          buscar : "",
          clientes:{
              idClientes  : 0,
              lectura:{ 
                  id:0,
                  label:''

            },
              codigo    : '',
              nombre    : '',
              dirección : '',
              zona: ''
        }, 
        clientes:[],

    }
        
},
     methods:{
         buscandoClientes(){
             this.cliente = this.cliente.filter((element,index,cliente) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
             if( this.buscar.length<=0){
                 this.obtenerClientes();
             }
         },
         buscandoCodigoClientes(store){
            let buscarCodigo = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.cliente.codigo);
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
             let store = this.abrirStore("tblclientes",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.cliente.idClientes = generarIdUnicoDesdeFecha();
                
                let data = await this.buscandoCodigoClientes(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.cliente);
                query.onsuccess=event=>{
                    this.obtenerClientes();
                    this.limpiar();
                    
                    this.mostrarMsg(' Cliente guardado con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el Cliente',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo de Cliente duplicado',true);
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
        obtenerClientes(){
            let store = this.abrirStore('tblclientes','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.cliente = data.result;
            };
            
        },
        mostrarClientes(cliente){
            this.cliente = cliente;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.cliente.idClientes='';
            this.cliente.codigo='';
            this.cliente.nombre='';
            this.cliente.dirección='';
            this.cliente.zona='';
          
            this.obtenerClientes();
        },
        eliminarClientes(cliente){
            if( confirm(`Esta seguro que desea eliminar el Cliente:  ${cliente.nombre}`) ){
                let store = this.abrirStore("tblclientes",'readwrite'),
                    req = store.delete(cliente.idClientes);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Cliente eliminado con exito',true);
                    this.obtenerClientes();
                };
                req.onerror=resp=>{
                    this.mostrarMsg('Error al eliminar el Cliente',true);
                    console.log( resp );
                };
            }
        },
        abrirStore(store,modo){
            let tx = db_clientes.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        //this.obtenerClientes();
    },
     template: `  
     
     <form v-on:submit.prevent=" guardarCliente" v-on:reset="limpiar" >
     <div class="row">
         <div class="col-sm-5">
             <div class="row p-2">
                 <div class="col-sm text-center text-white bg-primary">
                     <h5>CLIENTES</h5>
                 </div>
                 <div class="col-1 align-middle" >
                 <button type="button" onclick="appVue.forms['cliente'].mostrar=false" class="btn-close" aria-label="Close"></button>
             </div>

        </div>
        <div class="input-group-prepend card bg-light">
        <div class="row p-2">
      
                 <div class="col-sm">CODIGO:</div>
                 <div class="col-sm">
                     <input v-model="cliente.codigo"  required pattern="[A-Z Ñña-z]{3}[0-9]{6}" class="form-control form-control-sm"  placeholder="Ejem: ABC123456">

                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">NOMBRE: </div>
                 <div class="col-sm">
                     <input v-model="cliente.nombre" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm"  placeholder="Ejem: Nombre Apellido">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">DIRRECIÓN: </div>
                 <div class="col-sm">
                     <input v-model="cliente.dirrección" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm"  placeholder="Ejem: Casa">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">MUNICIPIO: </div>
                 <div class="col-sm">
                     <input v-model="cliente.Municipio" required pattern="[A-ZÑña-z0-9, ]{5,15}" type="text" class="form-control form-control-sm"  placeholder="Ejem: Usulután">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">DEPARTAMENTO: </div>
                 <div class="col-sm">
                     <input v-model="cliente.Departamento" required pattern="[A-ZÑña-z0-9, ]{5,15}" type="text" class="form-control form-control-sm" placeholder="Ejem: Usulután">
                 </div>
             </div>
             <div class="row p-2">
                 <div class="col-sm">ZONA: </div>
                 <div class="col-sm">
                     <input v-model="cliente.zona" required pattern="[0-9]{4}-[0-9]{4}"  type="text" class="form-control form-control-sm"  placeholder="Ejem: 1234-5678">
                 </div>

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


         <!----------CLIENTES REGRISTRADOS------->
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
                                 <!----------BUSCAR------->
                                 <td colspan="5">
                                     <input v-model="buscar" v-on:keyup="buscandoClientes" type="text" class="form-control form-control-sm" placeholder="Buscar Clientes"> 
                                     
                                 </td>
                             </tr>
                             <!----------TABLA------->
                             <tr>
                                 <th>CODIGO</th>
                                 <th>NOMBRE</th>
                                 <th>DIRRECIÓN</th>
                                 <th>MUNICIPIO</th>
                                 <th>DEPARTAMENTO</th>
                                 <th>ZONA</th>
                                 
                                 <th></th>
                             </tr>
                         </thead>
                         <tbody>
                             <!----------ACCION DE LA TABLA------->
                             <tr v-for="cliente in cliente" v-on:click="mostrarClientes(cliente)">
                                 <td>{{cliente.codigo }}</td>
                                 <td>{{cliente.nombre }}</td>
                                 <td>{{cliente.dirección }}</td>
                                 <td>{{cliente.municipio }}</td>
                                 <td>{{cliente.departamento }}</td>
                                 <td>{{cliente.zona }}</td>

                                 <td>
                                     <!----------BOTONES TABLA------->
                                     <a @click.stop="eliminarClientes(cliente.idClientes)" class="btn btn-danger">DEL</a>
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
    
