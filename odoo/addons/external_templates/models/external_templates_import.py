from odoo import models, fields
import requests
import json
from datetime import datetime

class ExternalTemplateImportWizard(models.TransientModel):
    _name = 'external.template.import.wizard'
    _description = 'Import External Templates Wizard'

    api_token = fields.Char(string="API Token", required=True)

    def import_templates(self):
        url = 'https://formify-app.onrender.com/odoo/aggregated-results'

        headers = {'Authorization': f'Bearer {self.api_token}'}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            raise Exception(f"Error fetching data: {response.text}")

        data = response.json()

        for template_data in data.get('templates', []):
            created_at_raw = template_data.get('createdAt')
            if created_at_raw:
                try:
                    dt = datetime.strptime(created_at_raw, '%Y-%m-%dT%H:%M:%S.%fZ')
                except ValueError:
                    dt = datetime.strptime(created_at_raw, '%Y-%m-%dT%H:%M:%SZ')
                created_at_clean = dt.strftime('%Y-%m-%d %H:%M:%S')
            else:
                created_at_clean = False

            template = self.env['external.template'].search([
                ('template_id', '=', template_data['id'])
            ], limit=1)

            if not template:
                template = self.env['external.template'].create({
                    'template_id': template_data['id'],
                    'title': template_data['title'],
                    'description': template_data.get('description'),
                    'topic': template_data.get('topic'),
                    'created_at': created_at_clean,
                    'author_name': template_data.get('authorNickname')
                })

            for question in template_data.get('questions', []):
                self.env['external.template.question'].create({
                    'template_id_ref': template.id,
                    'question_id': question['id'],
                    'text': question['text'],
                    'type': question['type'],
                    'min_value': question.get('min'),
                    'max_value': question.get('max'),
                    'average_value': question.get('average'),
                    'top_answers': json.dumps(question.get('topAnswers', [])),
                })