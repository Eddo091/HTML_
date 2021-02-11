var AlumnosBD = openDatabase('dbAlumnos','1.0','Registro de Alumnos',5*1024*1024);

window.id = 0;
if(!AlumnosBD){
    alert("Su Navegador no soporta SQLWeb");
}
var appVue = new Vue({
    el:'#appAlumnos',
    data:{
        /*accion : 'nuevo',*/
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
        alumno:[]
    
    },
    
    methods:{

        guardarAlumno(){
            AlumnosBD.transaction(tran=>{
                tran.executeSql('INSERT into alum alumnos(idAlumno,codigo,nombre,direccion,municipio,departamento,telefono,fechaNacimiento,sexo) VALUES(?,?,?,?,?,?,?,?,?)', 
                [++id,this.alum.codigo,this.alum.nombre,this.alum.direccion,this.alum.municipio,this.alum.departamento,this.alum.telefono,this.alum.fechaNacimiento,this.alum.sexo]);
                this.obtenerAlumnos();
                this.limpiar();
  
                this.msg = 'Alumno Guardado con exito.';
                this.error = false;
  
            }, ex=>{
                console.log(ex);
              });
          },
             modificarAlumno:function(alumno){
              appAlumnos.alumno = alumno;
              appAlumnos.alumno.accion = 'modificar';
              console.log("dato",alumno);
              
             },
        buscandoAlumnos(){
            this.alumnos = this.alumnos.filter((element,index,alumnos) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerAlumnos();
            }
        },
        
        

        eliminarAlumno:function(idAlumno){
            if(confirm("Estas seguro de eliminar este registro?")){
                fetch(`private/Modulo/alumnos/procesos.php?proceso=eliminarAlumno&alumno=${idAlumno}`).then(resp=>resp.json()).then(resp=>{
                    this.buscarAlumno();
                });
                
            
            }  
    },
        
        obtenerAlumnos(){
        AlumnosBD.transaction(tran=>{
                tran.executeSql('SELECT * FROM alumnos',[],(index,data)=>{
                    this.alumnos = data.rows;
                    id=data.rows.length;
                });
            }, err=>{
                console.log( err );
            });
        },

        mostrarAlumno(alum){
            this.alumnos=alum;
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
        eliminarAlumno(alum){
           AlumnosBD.transaction(tran=>{
                tran.executeSql('DELETE FROM alumnos WHERE idAlumno=0');
                  
                
            }, err=>{
                console.log( err );
            });
        },
    created(){
        AlumnosBD.transaction(tran=>{
            tran.executeSql('CREATE TABLE IF NOT EXISTS alumnos(idAlumno int PRIMARY KEY NOT NULL, codigo varchar(5), nombre varchar(65),direccion varchar(65), municipio varchar(15),departamento varchar(15),telefono varchar(9),fechanacimiento varchar(15),sexo varchar(10))');
        }, err=>{
            console.log( err );
        });
        this.obtenerAlumnos();
    }
<<<<<<< HEAD
=======

>>>>>>> 6359b04336058958bdd69a26ad868c75e0aa9ed5

    
    });