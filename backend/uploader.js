import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';

// Obtener directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL de tu servidor backend
const API_URL = 'http://localhost:3000';

// Función para encontrar todos los archivos JSON (excepto package*.json)
function findJsonFiles() {
  const files = fs.readdirSync(__dirname);
  return files
    .filter(file => 
      file.endsWith('.json') && 
      !file.includes('package') && 
      fs.statSync(path.join(__dirname, file)).isFile()
    )
    .map(file => {
      let type = file.replace('.json', '');
      return { path: file, type };
    });
}

// Función para dividir un array en chunks más pequeños
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Función para subir un archivo en chunks
async function uploadFileInChunks(filePath, type, chunkSize = 1000) {
  console.log(`Preparando ${filePath} para subir en chunks...`);
  
  try {
    // Leer y parsear el archivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    if (!Array.isArray(jsonData)) {
      console.error(`❌ El archivo ${filePath} no contiene un array JSON`);
      return null;
    }
    
    // Dividir en chunks
    const chunks = chunkArray(jsonData, chunkSize);
    console.log(`Dividido ${filePath} en ${chunks.length} chunks de máximo ${chunkSize} elementos`);
    
    // Subir cada chunk
    const chunkIds = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkContent = JSON.stringify(chunk);
      const chunkFileName = `${type}_chunk_${i+1}_of_${chunks.length}.json`;
      
      // Crear archivo temporal para el chunk
      const tempChunkPath = path.join(__dirname, chunkFileName);
      fs.writeFileSync(tempChunkPath, chunkContent);
      
      console.log(`Subiendo chunk ${i+1}/${chunks.length} de ${type} (${(chunkContent.length / 1024).toFixed(2)} KB)...`);
      
      // Crear FormData para el chunk
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempChunkPath));
      
      // Agregar metadatos
      const metadata = {
        type: type,
        contentType: 'application/json',
        isChunk: true,
        chunkNumber: i+1,
        totalChunks: chunks.length,
        originalFileName: filePath
      };
      formData.append('metadata', JSON.stringify(metadata));
      
      try {
        // Hacer la petición al endpoint /upload
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: formData.getHeaders()
        });
        
        // Verificar respuesta
        if (response.data && response.data.success) {
          chunkIds.push(response.data.fileId);
          console.log(`✅ Chunk ${i+1} subido correctamente con ID: ${response.data.fileId}`);
        } else {
          console.error(`❌ Error al subir chunk ${i+1}:`, response.data);
        }
      } catch (error) {
        console.error(`❌ Error al procesar chunk ${i+1}:`, error.message);
        if (error.response) {
          console.error('Detalles del error:', error.response.data);
        }
      }
      
      // Eliminar archivo temporal del chunk
      fs.unlinkSync(tempChunkPath);
    }
    
    console.log(`Completada subida de ${filePath} en ${chunkIds.length} chunks`);
    return { type, chunkIds, totalChunks: chunks.length };
    
  } catch (error) {
    console.error(`❌ Error general al procesar ${filePath}:`, error.message);
    return null;
  }
}

// Función principal de carga
async function uploadFilesToGridFS() {
  // Encontrar los archivos JSON
  const files = findJsonFiles();
  
  if (files.length === 0) {
    console.error('⚠️ No se encontraron archivos JSON para subir');
    console.log('Directorio actual:', __dirname);
    return {};
  }
  
  console.log(`Encontrados ${files.length} archivos JSON para subir:`);
  files.forEach(file => console.log(`- ${file.path}`));
  
  const uploadResults = {};
  
  for (const file of files) {
    const filePath = path.join(__dirname, file.path);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ El archivo ${file.path} no existe`);
      continue;
    }
    
    const fileSize = fs.statSync(filePath).size;
    
    // Para archivos grandes, usar subida en chunks
    if (fileSize > 1024 * 1024) { // Si es mayor a 1MB
      console.log(`Archivo grande detectado (${(fileSize / 1024 / 1024).toFixed(2)} MB), subiendo en chunks...`);
      const chunkResult = await uploadFileInChunks(filePath, file.type);
      if (chunkResult) {
        uploadResults[file.type] = chunkResult;
      }
    } else {
      // Para archivos pequeños, subir normalmente
      try {
        console.log(`Subiendo ${file.path} (${(fileSize / 1024).toFixed(2)} KB)...`);
        
        // Crear FormData
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        
        // Agregar metadatos
        const metadata = {
          type: file.type,
          contentType: 'application/json',
          uploadDate: new Date().toISOString()
        };
        formData.append('metadata', JSON.stringify(metadata));
        
        // Hacer la petición
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: formData.getHeaders()
        });
        
        // Verificar respuesta
        if (response.data && response.data.success) {
          console.log(`✅ ${file.path} subido correctamente con ID: ${response.data.fileId}`);
          uploadResults[file.type] = { type: file.type, fileId: response.data.fileId };
        } else {
          console.error(`❌ Error al subir ${file.path}:`, response.data);
        }
      } catch (error) {
        console.error(`❌ Error al procesar ${file.path}:`, error.message);
        if (error.response) {
          console.error('Detalles del error:', error.response.data);
        }
      }
    }
  }
  
  console.log('\nResumen de carga:');
  for (const type in uploadResults) {
    const result = uploadResults[type];
    if (result.chunkIds) {
      console.log(`- ${type}: Subido en ${result.chunkIds.length} chunks`);
    } else {
      console.log(`- ${type}: ${result.fileId}`);
    }
  }
  
  return uploadResults;
}

// Función para combinar chunks y procesar datos
async function importDataFromUploadedFiles(uploadResults) {
  console.log('\nImportando datos a las colecciones de MongoDB...');
  
  for (const type in uploadResults) {
    const result = uploadResults[type];
    
    // Si el archivo se subió en chunks
    if (result.chunkIds && result.chunkIds.length > 0) {
      console.log(`Procesando ${type} desde ${result.chunkIds.length} chunks...`);
      
      // Procesar cada chunk por separado
      for (let i = 0; i < result.chunkIds.length; i++) {
        const chunkId = result.chunkIds[i];
        try {
          console.log(`Importando chunk ${i+1}/${result.chunkIds.length} de ${type}...`);
          
          // Descargar el chunk
          const response = await axios.get(`${API_URL}/files/${chunkId}`, {
            responseType: 'arraybuffer'
          });
          
          // Convertir a JSON
          const content = Buffer.from(response.data).toString('utf8');
          const jsonData = JSON.parse(content);
          
          // Insertar datos del chunk
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            try {
              // Si es el primer chunk, limpiar la colección
              if (i === 0) {
                console.log(`Limpiando colección ${type}...`);
                await axios.delete(`${API_URL}/${type}`, {
                  data: { filter: {} }
                });
              }
              
              // Insertar datos
              console.log(`Insertando ${jsonData.length} documentos del chunk ${i+1}...`);
              await axios.post(`${API_URL}/${type}/bulk`, jsonData);
              console.log(`✅ Chunk ${i+1} importado correctamente`);
            } catch (bulkError) {
              console.error(`❌ Error en la importación del chunk ${i+1}:`, bulkError.message);
              
              // Intentar inserción individual
              let successCount = 0;
              for (const item of jsonData) {
                try {
                  await axios.post(`${API_URL}/${type}`, item);
                  successCount++;
                } catch (itemError) {
                  // Ignorar errores individuales
                }
                
                if (successCount % 100 === 0) {
                  console.log(`Progreso: ${successCount}/${jsonData.length}`);
                }
              }
              console.log(`✅ Insertados ${successCount}/${jsonData.length} documentos individualmente`);
            }
          }
        } catch (error) {
          console.error(`❌ Error al procesar chunk ${i+1}:`, error.message);
        }
      }
    } else if (result.fileId) {
      // Archivo único
      console.log(`Procesando ${type} desde archivo único...`);
      
      try {
        // Descargar el archivo
        const response = await axios.get(`${API_URL}/files/${result.fileId}`, {
          responseType: 'arraybuffer'
        });
        
        // Convertir a JSON
        const content = Buffer.from(response.data).toString('utf8');
        const jsonData = JSON.parse(content);
        
        // Insertar datos
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          try {
            // Limpiar colección
            console.log(`Limpiando colección ${type}...`);
            await axios.delete(`${API_URL}/${type}`, {
              data: { filter: {} }
            });
            
            // Insertar datos
            console.log(`Insertando ${jsonData.length} documentos...`);
            await axios.post(`${API_URL}/${type}/bulk`, jsonData);
            console.log(`✅ Datos importados correctamente`);
          } catch (bulkError) {
            console.error(`❌ Error en la importación:`, bulkError.message);
            
            // Intentar inserción individual
            console.log(`Intentando inserción individual...`);
            let successCount = 0;
            for (const item of jsonData) {
              try {
                await axios.post(`${API_URL}/${type}`, item);
                successCount++;
              } catch (itemError) {
                // Ignorar errores individuales
              }
              
              if (successCount % 100 === 0) {
                console.log(`Progreso: ${successCount}/${jsonData.length}`);
              }
            }
            console.log(`✅ Insertados ${successCount}/${jsonData.length} documentos individualmente`);
          }
        }
      } catch (error) {
        console.error(`❌ Error al procesar ${type}:`, error.message);
      }
    }
  }
}

// Función principal
async function main() {
  try {
    console.log('Directorio de trabajo:', __dirname);
    
    // Subir archivos
    const uploadResults = await uploadFilesToGridFS();
    
    if (Object.keys(uploadResults).length > 0) {
      // Importar datos
      await importDataFromUploadedFiles(uploadResults);
      console.log('\n¡Proceso completado con éxito!');
    } else {
      console.error('\n⚠️ No se pudieron subir archivos.');
    }
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

// Iniciar
main();