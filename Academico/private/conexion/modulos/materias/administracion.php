<?php
include('../../Config/Config.php');

EXTRACT($_REQUEST);

$class_materia = new materia($conexion);
$materia = isset($materia) ? $materia : '[]';
print_r($class_materia->recibirDatos($materia));

/**
 * @class materia representa la administracion de las materias
 */
class materias{
    /**
     * @__construct @param $db representa la conexion a la BD
     */
    private $datos=[], $db;
    public $respuesta = ['msg'=>'correcto'];
    public function __construct($db=''){
        $this->db = $db;
    }
    /**
     * @function recibirDatos recibe los datos de la materia
     * @param $materias son los datos que viene desde el FRONT-END
     */
    public function recibirDatos($materias){
        $this->datos = json_decode($materias, true);
        return $this->validarDatos();
    }
    private function validarDatos(){
        if( empty(trim($this->datos['Materia'])) ){
            $this->respuesta['msg'] = 'Por favor digite la descripcion de la materia';
        }
        if( empty(trim($this->datos['Codigo'])) ){
            $this->respuesta['msg'] = 'Por favor digite el codigo de la materia';
        }
        if( empty(trim($this->datos['Docente'])) ){
            $this->respuesta['msg'] = 'Por favor digite el docente de la materia';
        }
        if( empty(trim($this->datos['idMateria'])) ){
            $this->respuesta['msg'] = 'Algo inesperado paso y no se obtuvo el ID de la materia';
        }
        $this->almacenarDatos();
    }
    private function almacenarDatos(){
        if( $this->respuesta['msg']==='correcto' ){
            if( $this->datos['accion']==='nuevo' ){
                $this->db->consultas('
                    INSERT INTO materias (Materia,Codigo,Docente, idM) VALUES(
                        "'.$this->datos['Materia'].'",
                        "'.$this->datos['Codigo'].'",
                        "'.$this->datos['Docente'].'",
                        "'.$this->datos['idMateria'].'"
                    )
                ');
                return $this->db->obtenerUltimoId();
            } else if( $this->datos['accion']==='modificar' ){
                $this->db->consultas('
                    UPDATE materias SET
                        Materia        = "'.$this->datos['Materia'].'",
                        Codigo        = "'.$this->datos['Codigo'].'",
                        Docente   = "'.$this->datos['Docente'].'"
                    WHERE idC = "'.$this->datos['idMateria'].'"
                ');
                return $this->db->obtener_respuesta();
            } else if( $this->datos['accion']==='eliminar' ){
                $this->db->consultas('
                    DELETE materias 
                    FROM materias
                    WHERE idC = "'.$this->datos['idMateria'].'"
                ');
                return $this->db->obtener_respuesta();
            }
        } else{
            return $this->respuesta;
        }
    }
} 