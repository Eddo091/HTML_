var generarIdUnicoDesdeFecha=()=>{
    let fecha = new Date();//03/02/2021
    return Math.floor(fecha.getTime()/1000).toString(16);
}, db;
var appVue = new Vue({
   el:'#appAlumnos',
    data:{
        accion : 'nuevo',
        msg    : '',
        status : false,
        error  : false,
        buscar : "",
       alumno:{
            idAlumno  : 0,
            codigo      : '',
            nombre : '',
            dirección      : '',
            municipio      : '',
            departamento         : '',
            telefono      : '',
            fechaNacimiento      : '',
            sexo        : ''
        },
        alumn:[]
    },
    methods:{
        buscandoAlumnos(){
            this.alumnos = this.alumnos.filter((element,index,alumnos) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerAlumnos();
            }
        },
        guardarAlumno(){
            /**
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
            let store = this.abrirStore("tblalumnos",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.producto.idAlumno = generarIdUnicoDesdeFecha();

                let index = store.index("codigo"),
                    data = index.get(this.alumno.codigo);
                data.onsuccess=evt=>{
                    duplicado = evt.target.result!=undefined;
                };
            }
            if( duplicado==false){
                let query = store.put(this.alumno);
                query.onsuccess=event=>{
                    this.obtenerAlumnos();
                    this.limpiar();
                    
                    this.mostrarMsg('Alumno se guardo con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el Alumno',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo del estudiante duplicado',true);
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
                this.alumnos = data.result;
            };
        },
        mostrarAlumnos(alum){
            this.alumnos = alum;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.alumnos.idAlumno='';
            this.alumnos.codigo='';
            this.alumnos.nombre='';
            this.alumnos.dirección='';
            this.alumnos.municipio='';
            this.alumnos.departamento='';
            this.alumnos.telefono='';
            this.alumnos.fechaNacimiento='';
            this.alumnos.sexo='';
        },
        eliminarProducto(alum){
            if( confirm(`Esta seguro que desea eliminar el producto:  ${alum.nombre}`) ){
                let store = this.abrirStore("tblalumnos",'readwrite'),
                    req = store.delete(pro.idProducto);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Registro eliminado con exito',true);
                    this.obtenerAlumnos();
                };
                req.onerror=resp=>{
                    this.mostrarMsg('Error al eliminar el registro',true);
                    console.log( resp );
                };
            }
        },
        abrirBd(){
            let indexDb = indexedDB.open('db_alumnos',1);
            indexDb.onupgradeneeded=event=>{
                let req=event.target.result,
                    tblAlumnos = req.createObjectStore('tblalumnos',{keyPath:'idAlumno'});
                tblAlumnos.createIndex('idAlumno','idAlumno',{unique:true});
                tblAlumnos.createIndex('codigo','codigo',{unique:false});
            };
            indexDb.onsuccess = evt=>{
                db=evt.target.result;
                this.obtenerAlumnos();
            };
            indexDb.onerror=e=>{
                console.log("Error al conectar a la BD", e);
            };
        },
        abrirStore(store,modo){
            let tx = db.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        this.abrirBd();
    }
});