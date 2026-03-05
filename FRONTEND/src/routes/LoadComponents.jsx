import { lazy, Suspense } from "react";
import { element, object, string } from "../tools/Types";

const LoadComponent = ({ component, componentsMap, loading = null }) => {
    if (!componentsMap || !componentsMap[component]) {
        throw new Error(`El componente para la ruta "${component}" no existe.`);
    }

    const Component = lazy(componentsMap[component]);

    return (
        <Suspense fallback={loading}>
            <Component />
        </Suspense>
    );
};

LoadComponent.propTypes = {
    component: string.isRequired,
    componentsMap: object.isRequired,
    loading: element,
};

export default LoadComponent;
