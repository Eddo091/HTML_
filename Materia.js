Vue.component('component-Materias',{
    data:()=>{
        return{
        accion : 'nuevo',
        msg    : '',
        status : false,
        error  : false,
        buscar : "",
       Materia:{
            idMateria  : 0,
            codigomateria    : '',
            materia    : '',
            docente : '',
            horaclase : '',
            
       },

       Materia:[]
       }
       
    },
    methods:{
        buscandoClase(){
            this.materia = this.materia.filter((element,index,materia) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigomateria.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerMateria();
            }
        },
        buscandoCodigoMateria(store){
           let buscarCodigo= new Promise( (resolver,rechazar)=>{
               let index = store.index("codigomateria"),
                   data = index.get(this.materia.codigomateria);
               data.onsuccess=evt=>{
                   resolver(data);
               };
               data.onerror=evt=>{
                   rechazar(data);
               };
           });
           return buscarCodigo;
       },
    }
});