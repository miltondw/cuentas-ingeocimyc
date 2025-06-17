import { Link, useNavigate } from "react-router-dom";
import { ROUTES, buildUrl, useTypedParams } from "@/utils/routes";

/**
 * Ejemplo de componente que utiliza las utilidades de rutas
 *
 * Este archivo muestra cómo usar las utilidades de rutas para:
 * - Crear enlaces tipados
 * - Acceder a parámetros de ruta con tipos correctos
 * - Navegar programáticamente a rutas
 */

export function NavigationExample() {
  // Uso de useTypedParams para obtener parámetros con tipos correctos
  const { projectId } = useTypedParams<"projectId">();
  const navigate = useNavigate();

  // Navegar programáticamente a otra ruta usando buildUrl
  const handleViewProfile = (profileId: string) => {
    const profileUrl = buildUrl(ROUTES.LAB.PROFILE_DETAIL, {
      projectId: projectId,
      profileId: profileId,
    });

    navigate(profileUrl);
  };

  return (
    <div>
      <h2>Ejemplo de Navegación</h2>

      {/* Enlaces directos usando constantes ROUTES */}
      <nav>
        <ul>
          <li>
            <Link to={ROUTES.HOME}>Inicio</Link>
          </li>
          <li>
            <Link to={ROUTES.PROFILE}>Mi Perfil</Link>
          </li>
          <li>
            <Link to={ROUTES.LAB.PROJECTS}>Proyectos Lab</Link>
          </li>
        </ul>
      </nav>

      {/* Enlaces con parámetros usando buildUrl */}
      <h3>Perfiles en este Proyecto</h3>
      <ul>
        {["1", "2", "3"].map((profileId) => (
          <li key={profileId}>
            <Link
              to={buildUrl(ROUTES.LAB.PROFILE_DETAIL, {
                projectId: projectId,
                profileId,
              })}
            >
              Ver perfil {profileId}
            </Link>
            <button onClick={() => handleViewProfile(profileId)}>
              Ver (navegación programática)
            </button>
          </li>
        ))}
      </ul>

      {/* Nuevo perfil */}
      <Link to={buildUrl(ROUTES.LAB.NEW_PROFILE, { projectId })}>
        Crear nuevo perfil
      </Link>
    </div>
  );
}
