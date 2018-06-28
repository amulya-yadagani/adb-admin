export const resourceTypes = [{
	"name": "Application",
	"image_file": "application",
	"targets": [""],
	"permits": false
}, {
	"name": "Permission",
	"image_file": "permission",
	"targets": ["Application", "Title", "Cluster", "JobRequest"],
	"permits": true
}, {
	"name": "Title",
	"image_file": "title",
	"targets": ["Module"],
	"permits": true
}, {
	"name": "Module",
	"image_file": "module",
	"targets": ["Cluster"],
	"permits": true
}, {
	"name": "Cluster",
	"image_file": "cluster",
	"targets": ["Application"],
	"permits": true
}, {
	"name": "Role",
	"image_file": "role",
	"targets": ["Application"],
	"permits": false
}, {
	"name": "JobRequest",
	"image_file": "edit",
	"targets": ["Application"],
	"permits": false
}]