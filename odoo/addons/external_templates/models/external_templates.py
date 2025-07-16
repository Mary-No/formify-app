from odoo import models, fields, api
import requests

class ExternalTemplate(models.Model):
    _name = 'external.template'
    _description = 'External Template from Node API'
    template_id = fields.Char(string='External ID', required=True, index=True)
    title = fields.Char(string='Title')
    description = fields.Text(string='Description')
    topic = fields.Char(string='Topic')
    created_at = fields.Datetime(string='Created At')
    author_name = fields.Char(string='Author')
    question_ids = fields.One2many('external.template.question', 'template_id_ref', string='Questions')
    author_id = fields.Char(string='Author ID', index=True)

class ExternalTemplateQuestion(models.Model):
    _name = 'external.template.question'
    _description = 'Questions of External Template'

    template_id_ref = fields.Many2one('external.template', string='Template', ondelete='cascade')
    question_id = fields.Char(string='External Question ID')
    text = fields.Char(string='Question Text')
    type = fields.Char(string='Question Type')
    min_value = fields.Float(string='Min')
    max_value = fields.Float(string='Max')
    average_value = fields.Float(string='Average')
    top_answers = fields.Text(string='Top Answers JSON')


class ExternalTemplateImportWizard(models.TransientModel):
    _name = 'external.template.import.wizard'
    _description = 'Import Templates From API'

    api_token = fields.Char(string='API Token', required=True)

    def import_templates(self):
        api_url = 'http://host.docker.internal:3000/api/aggregated-results'
        headers = {'Authorization': f'Bearer {self.api_token}'}

        response = requests.get(api_url, headers=headers)
        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code} - {response.text}")

        data = response.json()
        templates = data.get('templates', [])

        for t in templates:
            template = self.env['external.template'].create({
                'template_id': t['id'],
                'title': t['title'],
                'description': t.get('description'),
                'topic': t.get('topic'),
                'created_at': t.get('createdAt'),
                'author_name': t.get('authorNickname'),
                'author_id': t.get('authorId'),
            })

            for q in t['questions']:
                self.env['external.template.question'].create({
                    'template_id_ref': template.id,
                    'question_id': q['id'],
                    'text': q['text'],
                    'type': q['type'],
                    'min_value': q.get('min'),
                    'max_value': q.get('max'),
                    'average_value': q.get('average'),
                    'top_answers': str(q.get('topAnswers')),
                })
class ResUsers(models.Model):
    _inherit = 'res.users'

    external_user_id = fields.Char(string='External User ID')