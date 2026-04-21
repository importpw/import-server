'use client';

import { ObjectInspector } from 'react-inspector';

export default function ObjectInspectorClient({ data }: { data: unknown }) {
	return (
		<ObjectInspector
			expandLevel={2}
			sortObjectKeys={true}
			data={data}
		/>
	);
}
