import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- IMPORTANTE
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule } from '@angular/forms';

/* =======================================
   CONSULTAS E COMANDOS
   ======================================= */
const GET_TAKS = gql`
  query {
    tasks {
      id, title, description, dueDate, order
      column { id name }
    }
    boards {
      id, columns { id name }
    }
  }
`;

const CREATE_TASK = gql`
  mutation($input: CreateTaskInput!) {
    createTask(input: $input) { id title }
  }
`;

const MOVE_TASK = gql`
  mutation($input: MoveTaskInput!) {
    moveTask(input: $input) { id }
  }
`;

const DELETE_TASK = gql`
  mutation($id: String!) {
    deleteTask(id: $id)
  }
`;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  // Listas
  todo: any[] = [];
  doing: any[] = [];
  done: any[] = [];

  // Dashboard
  totalTasks = 0;
  progress = 0;
  atrasadas = 0;

  // Controle
  colunasIds: any = {}; 
  selecionado: any = null;

  // Formulário
  novoTitulo = '';
  novaDescricao = '';
  novoPrazo = '';

  constructor(
    private apollo: Apollo,
    private cdr: ChangeDetectorRef // <--- INJEÇÃO DA CURA PARA O BUG
  ) {}

  ngOnInit() {
    this.carregarDados();
    // Define a data de hoje no input
    const hoje = new Date().toISOString().split('T')[0];
    this.novoPrazo = hoje;
  }

  carregarDados() {
    this.apollo
      .watchQuery({ 
        query: GET_TAKS, 
        fetchPolicy: 'network-only' // Garante que sempre busca dados frescos
      })
      .valueChanges.subscribe((result: any) => {
        const tasksRaw = result.data?.tasks || [];
        const boards = result.data?.boards || [];

        // Mapeia colunas
        if (boards.length > 0 && boards[0].columns) {
            boards[0].columns.forEach((col: any) => {
                this.colunasIds[col.name] = col.id;
            });
        }

        // Formata Tarefas
        const allTasks = tasksRaw.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate,
          columnId: t.column?.id,
          columnName: t.column?.name
        }));

        // Separa nas listas (aceitando nomes em PT ou EN)
        this.todo = allTasks.filter((t: any) => ['A Fazer', 'TODO'].includes(t.columnName));
        this.doing = allTasks.filter((t: any) => ['Em Progresso', 'DOING'].includes(t.columnName));
        this.done = allTasks.filter((t: any) => ['Feito', 'DONE'].includes(t.columnName));

        // Atualiza Dashboard e FORÇA A TELA A PINTAR
        this.atualizarEstatisticas();
        this.cdr.detectChanges(); // <--- O SEGREDO MÁGICO AQUI
      });
  }

  atualizarEstatisticas() {
    // 1. Total
    this.totalTasks = this.todo.length + this.doing.length + this.done.length;
    
    // 2. Progresso (Evita divisão por zero)
    if (this.totalTasks > 0) {
      this.progress = Math.round((this.done.length / this.totalTasks) * 100);
    } else {
      this.progress = 0;
    }

    // 3. Atrasadas (Ignora as que já estão "Feito")
    const hoje = new Date().toISOString().split('T')[0];
    const pendentes = [...this.todo, ...this.doing];
    
    this.atrasadas = pendentes.filter(t => t.dueDate && t.dueDate < hoje).length;
  }

  adicionar() {
    if (!this.novoTitulo.trim()) return;

    let idColuna = this.colunasIds['A Fazer'] || this.colunasIds['TODO'];
    
    // Fallback: se não achar pelo nome, pega o primeiro ID disponível
    if (!idColuna && Object.values(this.colunasIds).length > 0) {
        idColuna = Object.values(this.colunasIds)[0];
    }

    const input = {
      title: this.novoTitulo,
      description: this.novaDescricao,
      dueDate: this.novoPrazo || null,
      order: 0,
      columnId: idColuna
    };

    this.apollo.mutate({
        mutation: CREATE_TASK,
        variables: { input },
        refetchQueries: [{ query: GET_TAKS }], // Recarrega tudo após adicionar
      }).subscribe(() => {
        this.novoTitulo = '';
        this.novaDescricao = '';
        this.novoPrazo = new Date().toISOString().split('T')[0];
      });
  }

  remover(id: string) {
    if (confirm('Tem certeza?')) {
        this.apollo.mutate({
            mutation: DELETE_TASK,
            variables: { id },
            refetchQueries: [{ query: GET_TAKS }]
        }).subscribe();
        
        if (this.selecionado && this.selecionado.id === id) {
            this.selecionado = null;
        }
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    
    // Atualiza visualmente na hora
    this.atualizarEstatisticas();

    const task = event.container.data[event.currentIndex];
    const nomeNovaColuna = event.container.id; 
    const idNovaColuna = this.colunasIds[nomeNovaColuna];

    if (idNovaColuna) {
        this.apollo.mutate({
            mutation: MOVE_TASK,
            variables: {
                input: {
                    taskId: task.id,
                    toColumnId: idNovaColuna,
                    newOrder: event.currentIndex
                }
            }
        }).subscribe();
    }
  }

  abrirDetalhes(task: any) { this.selecionado = task; }
  fecharDetalhes() { this.selecionado = null; }
}